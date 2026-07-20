// French counterpart of fetchPokemons.ts. Assembles the French list-card dataset:
// every basic card additionally carries a resolved `frName` (never English — throws
// via resolveFrField otherwise) and a URL `slug` derived from the French name.
//
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
import { mapWithConcurrency } from "./mapWithConcurrency";
import { getRequest, getPokemonCount } from "./request";
import { POKE_API_URL, FETCH_CONCURRENCY } from "../../constants/FetchPokemons";
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
    // Blank the English stage name: EvolutionStageFr renders `frName` (always
    // resolved via maps), so the EN name only bloated __NEXT_DATA__.
    name: "",
    frName: maps.idToFrName[stage.id],
    slug: maps.idToSlug[stage.id],
  }));

  return {
    ...enFull,
    // Strip the English-only fields the FR detail page never reads — it renders
    // frDescription/frCategory/frAbilities — so the English flavor text and
    // ability names stop shipping in the page's hydration JSON. `name` is KEPT:
    // the GEO opener surfaces it as the "(anglais : …)" cross-language anchor.
    description: "",
    category: "",
    abilities: [],
    frName,
    frCategory,
    frDescription,
    frAbilities: abilityFrNames,
    evolutionChain,
  };
};

// Shared runtime request (record/replay + retry) — see services/fetchPokemons/request.ts.
const request = async (url: string): Promise<any> => (await getRequest())(url);

const fetchPokemonByNameOrId = async (name: string) => await request(`${POKE_API_URL}pokemon/${name}`);

// Build-time only. Mirrors fetchAllPokemons' two-wave (pokemon, then species) fetch,
// then resolves each French name, builds the slug↔id map over ALL French names (which
// runs buildSlugIdMap's collision guard), and attaches each pokemon's slug.
export const fetchAllPokemonsFr = async (): Promise<IBasicPokemon[]> => {
  const count = await getPokemonCount();
  console.log(`[build] Fetching French Pokédex list (${count} Pokémon + species)…`);
  const pokemonsData = await request(`${POKE_API_URL}pokemon?limit=${count}`);
  const pokemonsName = pokemonsData.results.map(extractPokemonName);
  const pokemonData = await mapWithConcurrency<string, IPokemonResponseType>(pokemonsName, fetchPokemonByNameOrId, FETCH_CONCURRENCY);
  const speciesData = await mapWithConcurrency<IPokemonResponseType, Specie>(pokemonData, (pokemon) => request(pokemon.species.url), FETCH_CONCURRENCY);

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
    // Keep the English card `name`: filterPokemonsByName matches name OR frName,
    // so retaining it preserves the English-name fallback search on the FR home.
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

  // First call in each build worker pays a ~1025-species fetch (then memoized) —
  // the main pause at the start of a worker's static-generation run. Log it so the
  // build doesn't look hung while this runs.
  const count = await getPokemonCount();
  console.log(`[build] Building FR name/slug map (${count} species, once per worker)…`);
  const ids = Array.from({ length: count }, (_, i) => i + 1);
  const species = await mapWithConcurrency<number, Specie>(ids, (id) => request(`${POKE_API_URL}pokemon-species/${id}`), FETCH_CONCURRENCY);

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
  console.log(`[build] FR name/slug map ready (${Object.keys(idToSlug).length} entries).`);
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
