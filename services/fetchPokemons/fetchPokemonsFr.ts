// French counterpart of fetchPokemons.ts. Assembles the French list-card dataset:
// every basic card additionally carries a resolved `frName` (never English — throws
// via resolveFrField otherwise) and a URL `slug` derived from the French name.
//
// A local `request` retry helper is kept here (rather than imported) to isolate the
// FR fetch path, consistent with fetchFrData.ts.
import { formatToBasicPokemon, formatEvolvesFrom } from "../../utils/pokemonFormatter/pokemonFormatter";
import { extractPokemonName } from "../../utils/pokemonFormatter/extractors";
import {
  extractPokemonNameFr,
  extractPokemonCategoryFr,
  extractPokemonDescriptionFr,
  type SpecieFr,
} from "../../utils/pokemonFormatter/extractorsFr";
import { resolveFrField, type FrOverrides } from "../../utils/fr/resolveFrField";
import { buildSlugIdMap } from "../../utils/slugify";
import { Specie, IPokemonResponseType, Ability } from "../../utils/pokemonFormatter/types";
import { fetchPokemonDetailsByNameOrId } from "./fetchPokemons";
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

// PURE, testable core for the detail page. Returns the English full pokemon with
// its resolved French name/category/description attached, the caller-resolved
// `frAbilities` (already one-per-visible-ability, in `enFull.abilities` order), and
// an evolution chain whose every stage gains its French name and slug from `maps`.
// resolveFrField throws (FrCoverageError) if any required French field is missing
// from both PokéAPI and the overrides, so English can never leak into the FR dataset.
export const augmentFullWithFr = (
  enFull: IFullPokemon,
  species: SpecieFr,
  abilityFrNames: string[],
  maps: { idToFrName: Record<number, string>; idToSlug: Record<number, string> },
  overridesArg: FrOverrides
): IFullPokemon => {
  const id = String(enFull.id);

  const frName = resolveFrField({
    entityType: "names",
    id,
    field: "name",
    apiValue: extractPokemonNameFr(species),
    overrides: overridesArg,
  });

  const frCategory = resolveFrField({
    entityType: "category",
    id,
    field: "text",
    apiValue: extractPokemonCategoryFr(species),
    overrides: overridesArg,
  });

  const frDescription = resolveFrField({
    entityType: "flavorText",
    id,
    field: "text",
    apiValue: extractPokemonDescriptionFr(species),
    overrides: overridesArg,
  });

  const evolutionChain = enFull.evolutionChain.map((stage) => ({
    ...stage,
    frName: maps.idToFrName[stage.id],
    slug: maps.idToSlug[stage.id],
  }));

  return {
    ...enFull,
    frName,
    frCategory,
    frDescription,
    frAbilities: abilityFrNames,
    evolutionChain,
  };
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
let cache: {
  slugToId: Record<string, number>;
  idToSlug: Record<number, string>;
  idToFrName: Record<number, string>;
} | null = null;

export const buildFrSlugMaps = async (): Promise<{
  slugToId: Record<string, number>;
  idToSlug: Record<number, string>;
  idToFrName: Record<number, string>;
}> => {
  if (cache) {
    return cache;
  }

  const ids = Array.from({ length: MAX_POKEMON_ID_ALLOWED }, (_, i) => i + 1);
  const species = await Promise.all<Specie>(ids.map((id) => request(`${POKE_API_URL}pokemon-species/${id}`)));

  const idToFrName: Record<number, string> = {};
  const entries = species.map((specie, index) => {
    const frName = resolveFrField({
      entityType: "names",
      id: String(ids[index]),
      field: "name",
      apiValue: extractPokemonNameFr(specie as unknown as SpecieFr),
      overrides,
    });
    idToFrName[ids[index]] = frName;
    return { id: ids[index], frName };
  });

  const { slugToId, idToSlug } = buildSlugIdMap(entries);
  cache = { slugToId, idToSlug, idToFrName };
  return cache;
};

const isAbilityVisible = (ability: Ability) => !ability.is_hidden;

// Resolve one visible ability's French name: /ability/{slug} → the fr `names[]`
// entry → resolveFrField (throws if neither API nor overrides carry it).
const fetchAbilityFrName = async (abilitySlug: string): Promise<string> => {
  const abilityData = await request(`${POKE_API_URL}ability/${abilitySlug}`);
  const apiValue =
    (abilityData.names as Array<{ language: { name: string }; name: string }>).find(
      (entry) => entry.language.name === "fr"
    )?.name ?? null;

  return resolveFrField({
    entityType: "abilities",
    id: abilitySlug,
    field: "name",
    apiValue,
    overrides,
  });
};

// Build-time only. Resolves the FR detail dataset for a French slug: looks up the
// id via the memoized slug maps, reuses the English full-detail fetch, then layers
// on the French species fields and the visible abilities' French names (in the same
// order as `enFull.abilities`, matching extractAbilitiesFromPokemon's !is_hidden
// filter) via the pure augmentFullWithFr. prev/next slugs come from adjacent ids.
export const fetchPokemonDetailFrBySlug = async (
  slug: string
): Promise<{ pokemon: IFullPokemon; prevSlug: string | null; nextSlug: string | null }> => {
  const maps = await buildFrSlugMaps();
  const id = maps.slugToId[slug];

  const enFull = await fetchPokemonDetailsByNameOrId(String(id));
  const species = (await request(`${POKE_API_URL}pokemon-species/${id}`)) as unknown as SpecieFr;

  // Re-fetch pokemon/{id} for the ability slugs; filter/order exactly like the EN
  // extractAbilitiesFromPokemon so frAbilities[i] lines up with enFull.abilities[i].
  const pokemonData = await fetchPokemonByNameOrId(String(id));
  const visibleAbilitySlugs = (pokemonData.abilities as Ability[])
    .filter(isAbilityVisible)
    .map((ability) => ability.ability.name);
  const abilityFrNames = await Promise.all(visibleAbilitySlugs.map(fetchAbilityFrName));

  const pokemon = augmentFullWithFr(enFull, species, abilityFrNames, maps, overrides);

  return {
    pokemon,
    prevSlug: maps.idToSlug[id - 1] ?? null,
    nextSlug: maps.idToSlug[id + 1] ?? null,
  };
};
