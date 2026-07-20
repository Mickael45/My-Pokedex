// Candidate producer (orchestrator fetchCmd). Runs the full PokéAPI crawl ONCE in
// record mode and writes a canonical snapshot the build then replays offline:
//
//   data/candidate/latest.json    URL→JSON snapshot (canonical, stable hash)
//   data/candidate/manifest.json  { recordCount, sourceTimestamp }
//
// It crawls through the very same fetchers the pages/sitemap/coverage use, so every
// URL the replayed build needs is captured. Run via: POKEDEX_SNAPSHOT=record tsx …
import { mkdir, writeFile } from "node:fs/promises";
import { getSnapshotStore, getPokemonCount } from "../services/fetchPokemons/request";
import {
  fetchAllPokemons,
  buildEnSlugMaps,
  fetchPokemonDetailEnBySlug,
} from "../services/fetchPokemons/fetchPokemons";
import {
  fetchAllPokemonsFr,
  buildFrSlugMaps,
  fetchPokemonDetailFrBySlug,
} from "../services/fetchPokemons/fetchPokemonsFr";
import { fetchFrRawDataset } from "../services/fetchPokemons/fetchFrData";
import { mapWithConcurrency } from "../services/fetchPokemons/mapWithConcurrency";
import { FETCH_CONCURRENCY } from "../constants/FetchPokemons";

const CANDIDATE_DIR = "data/candidate";

const main = async () => {
  if (process.env.POKEDEX_SNAPSHOT !== "record") {
    throw new Error(
      "buildCandidate must run with POKEDEX_SNAPSHOT=record (otherwise nothing is captured)."
    );
  }

  // Dynamic dex size — never hardcoded. Also seeds the snapshot's count URL.
  const count = await getPokemonCount();
  console.log(`[candidate] Dex size from PokéAPI: ${count} species. Crawling…`);

  // Lists (EN + FR) and the slug↔id maps. Dedup means the shared list/species
  // fetches are paid once even though several crawls reference them.
  await fetchAllPokemons();
  await fetchAllPokemonsFr();
  const en = await buildEnSlugMaps();
  const fr = await buildFrSlugMaps();

  // Every detail page (EN + FR), exactly as getStaticProps will request them.
  const ids = Array.from({ length: count }, (_, i) => i + 1);
  await mapWithConcurrency(
    ids,
    async (id) => {
      const enSlug = en.idToSlug[id];
      if (enSlug) await fetchPokemonDetailEnBySlug(enSlug);
      const frSlug = fr.idToSlug[id];
      if (frSlug) await fetchPokemonDetailFrBySlug(frSlug);
    },
    FETCH_CONCURRENCY
  );

  // FR coverage dataset (species + types + abilities).
  await fetchFrRawDataset();

  const store = await getSnapshotStore();
  if (!store) throw new Error("record store missing — runtime did not initialize in record mode");

  await mkdir(CANDIDATE_DIR, { recursive: true });
  await writeFile(`${CANDIDATE_DIR}/latest.json`, store.serialize());
  await writeFile(
    `${CANDIDATE_DIR}/manifest.json`,
    JSON.stringify({ recordCount: count, sourceTimestamp: new Date().toISOString() }, null, 2)
  );

  console.log(
    `[candidate] Wrote ${store.size()} snapshot entries for ${count} species → ${CANDIDATE_DIR}/`
  );
};

main().catch((err) => {
  console.error("[candidate] FAILED:", err);
  process.exit(1);
});
