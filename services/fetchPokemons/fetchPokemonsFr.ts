// French counterpart of fetchPokemons.ts. Assembles the French list-card dataset:
// every basic card additionally carries a resolved `frName` (never English — throws
// via resolveFrField otherwise) and a URL `slug` derived from the French name.
//
// A local `request` retry helper is kept here (rather than imported) to isolate the
// FR fetch path, consistent with fetchFrData.ts.
import { formatToBasicPokemon, formatEvolvesFrom } from "../../utils/pokemonFormatter/pokemonFormatter";
import { extractPokemonName } from "../../utils/pokemonFormatter/extractors";
import { extractPokemonNameFr, type SpecieFr } from "../../utils/pokemonFormatter/extractorsFr";
import { resolveFrField, type FrOverrides } from "../../utils/fr/resolveFrField";
import { buildSlugIdMap } from "../../utils/slugify";
import { Specie, IPokemonResponseType } from "../../utils/pokemonFormatter/types";
import { MAX_POKEMON_ID_ALLOWED, POKE_API_URL } from "../../constants/FetchPokemons";
import frOverridesJson from "../../locales/fr-overrides.json";

const overrides = frOverridesJson as FrOverrides;

// PURE, testable core. Returns the basic card with its resolved French name and
// slug attached. `frName` comes from PokéAPI's fr entry, falling back to the
// overrides file; resolveFrField throws (FrCoverageError) if neither has it, so an
// English name can never leak into the French dataset.
export const augmentBasicWithFr = (
  basic: IBasicPokemon,
  species: SpecieFr,
  slug: string,
  overridesArg: FrOverrides
): IBasicPokemon => {
  const frName = resolveFrField({
    entityType: "names",
    id: String(basic.id),
    field: "name",
    apiValue: extractPokemonNameFr(species),
    overrides: overridesArg,
  });

  return { ...basic, frName, slug };
};

const REQUEST_RETRIES = 3;
const REQUEST_RETRY_DELAY_MS = 400;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry transient failures (network errors and non-2xx) with a small backoff so a
// single reset connection doesn't reject the whole Promise.all and crash the build.
const request = async (url: string, attempt = 1): Promise<any> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request to ${url} failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (attempt >= REQUEST_RETRIES) {
      throw error;
    }
    await wait(REQUEST_RETRY_DELAY_MS * attempt);
    return request(url, attempt + 1);
  }
};

const fetchPokemonByNameOrId = async (name: string) => await request(`${POKE_API_URL}pokemon/${name}`);

// Build-time only. Mirrors fetchAllPokemons' two-wave (pokemon, then species) fetch,
// then resolves each French name, builds the slug↔id map over ALL French names (which
// runs buildSlugIdMap's collision guard), and attaches each pokemon's slug.
export const fetchAllPokemonsFr = async (): Promise<IBasicPokemon[]> => {
  const pokemonsData = await request(`${POKE_API_URL}pokemon?limit=${MAX_POKEMON_ID_ALLOWED}`);
  const pokemonsName = pokemonsData.results.map(extractPokemonName);
  const pokemonData = await Promise.all<IPokemonResponseType>(pokemonsName.map(fetchPokemonByNameOrId));
  const speciesData = await Promise.all<Specie>(pokemonData.map((pokemon) => request(pokemon.species.url)));

  // Resolve every French name first so the slug map (and its collision guard) sees
  // the complete set before any slug is assigned.
  const entries = pokemonData.map((pokemon, index) => ({
    id: pokemon.id,
    frName: resolveFrField({
      entityType: "names",
      id: String(pokemon.id),
      field: "name",
      apiValue: extractPokemonNameFr(speciesData[index] as unknown as SpecieFr),
      overrides,
    }),
  }));
  const { idToSlug } = buildSlugIdMap(entries);

  return pokemonData.map((pokemon, index) => {
    const basic: IBasicPokemon = {
      ...formatToBasicPokemon(pokemon),
      evolvesFrom: formatEvolvesFrom(speciesData[index]),
    };
    return augmentBasicWithFr(basic, speciesData[index] as unknown as SpecieFr, idToSlug[pokemon.id], overrides);
  });
};

// Build-time slug↔id maps, MODULE-MEMOIZED so later consumers (Plan 3's
// getStaticPaths, the language switcher, the Task-7 home) reuse a single fetch.
// Only species are fetched here — the lighter payload map-only callers need.
let cache: { slugToId: Record<string, number>; idToSlug: Record<number, string> } | null = null;

export const buildFrSlugMaps = async (): Promise<{
  slugToId: Record<string, number>;
  idToSlug: Record<number, string>;
}> => {
  if (cache) {
    return cache;
  }

  const ids = Array.from({ length: MAX_POKEMON_ID_ALLOWED }, (_, i) => i + 1);
  const species = await Promise.all<Specie>(ids.map((id) => request(`${POKE_API_URL}pokemon-species/${id}`)));

  const entries = species.map((specie, index) => ({
    id: ids[index],
    frName: resolveFrField({
      entityType: "names",
      id: String(ids[index]),
      field: "name",
      apiValue: extractPokemonNameFr(specie as unknown as SpecieFr),
      overrides,
    }),
  }));

  cache = buildSlugIdMap(entries);
  return cache;
};
