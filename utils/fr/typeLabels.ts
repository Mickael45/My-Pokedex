// utils/fr/typeLabels.ts
// French display labels for Pokémon types. `types` stays an English-slug CSV
// everywhere else; this only builds a Record<engSlug, frLabel> for display.
import { POKE_API_URL } from "../../constants/FetchPokemons";
import frOverridesJson from "../../locales/fr-overrides.json";
import { resolveFrField, FrOverrides } from "./resolveFrField";

type TypeRaw = { name: string; names: Array<{ language: { name: string }; name: string }> };

const frName = (t: TypeRaw): string | null => t.names.find((n) => n.language.name === "fr")?.name ?? null;

// PURE, testable deliverable: English type slug → French label.
// Throws (via resolveFrField) when a type has neither a PokéAPI fr name nor an override.
export const resolveTypeLabels = (typesRaw: TypeRaw[], overrides: FrOverrides): Record<string, string> => {
  const labels: Record<string, string> = {};
  for (const t of typesRaw) {
    labels[t.name] = resolveFrField({
      entityType: "typeLabels",
      id: t.name,
      field: "label",
      apiValue: frName(t),
      overrides,
    });
  }
  return labels;
};

// Local `request` retry helper, mirroring services/fetchPokemons/fetchFrData.ts.
// A local copy is sanctioned to keep the FR build path isolated.
const REQUEST_RETRIES = 3;
const REQUEST_RETRY_DELAY_MS = 400;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const request = async (url: string, attempt = 1): Promise<any> => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request to ${url} failed with status ${res.status}`);
    return await res.json();
  } catch (error) {
    if (attempt >= REQUEST_RETRIES) throw error;
    await wait(REQUEST_RETRY_DELAY_MS * attempt);
    return request(url, attempt + 1);
  }
};

const overrides = frOverridesJson as FrOverrides;

// Build-time, MODULE-MEMOIZED: fetch the type list once, filter out the
// non-battle pseudo-types, fetch each real type, resolve to French labels, and
// cache the promise so the 1025 detail pages (Plan 3) reuse a single fetch.
let cached: Promise<Record<string, string>> | null = null;

export const getFrTypeLabels = (): Promise<Record<string, string>> => {
  if (!cached) {
    cached = (async () => {
      const typeList: { results: Array<{ name: string }> } = await request(`${POKE_API_URL}type`);
      const realTypes = typeList.results.filter((t) => !["unknown", "shadow", "stellar"].includes(t.name));
      const typesRaw: TypeRaw[] = await Promise.all(realTypes.map((t) => request(`${POKE_API_URL}type/${t.name}`)));
      return resolveTypeLabels(typesRaw, overrides);
    })();
  }
  return cached;
};
