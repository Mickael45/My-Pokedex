// services/fetchPokemons/fetchFrData.ts
import { POKE_API_URL, MAX_POKEMON_ID_ALLOWED } from "../../constants/FetchPokemons";
import { FR_STAT_LABELS } from "../../constants/FrStatLabels";
import { collectFrGap, FrOverrides } from "../../utils/fr/resolveFrField";
import {
  extractPokemonNameFr,
  extractPokemonCategoryFr,
  extractPokemonDescriptionFr,
  type SpecieFr,
} from "../../utils/pokemonFormatter/extractorsFr";

const findEn = <T extends { language: { name: string } }>(entries: T[]): T | undefined =>
  entries.find((e) => e.language.name === "en");
const findEnName = (entries: Array<{ language: { name: string }; name: string }>) => findEn(entries)?.name ?? "";

export type FrSpeciesRaw = { id: number; names: any[]; genera: any[]; flavor_text_entries: any[] };
export type FrTypeRaw = { name: string; names: Array<{ language: { name: string }; name: string }> };
export type FrAbilityRaw = { name: string; names: Array<{ language: { name: string }; name: string }> };
export type FrRawDataset = { species: FrSpeciesRaw[]; types: FrTypeRaw[]; abilities: FrAbilityRaw[] };

// PURE: given fetched raw data + current overrides, list every in-scope displayed
// field with no French value from either source, each with its English reference.
export const computeFrGaps = (
  dataset: FrRawDataset,
  overrides: FrOverrides
): Array<{ entityType: string; id: string; field: string; englishRef: string }> => {
  const gaps: Array<{ entityType: string; id: string; field: string; englishRef: string }> = [];
  const push = (entityType: string, id: string, field: string, apiValue: string | null, englishRef: string) => {
    if (collectFrGap({ entityType, id, field, apiValue, overrides })) gaps.push({ entityType, id, field, englishRef });
  };

  for (const s of dataset.species) {
    const specie = s as unknown as SpecieFr;
    const id = String(s.id);
    push("names", id, "name", extractPokemonNameFr(specie), findEnName(s.names));
    push("category", id, "text", extractPokemonCategoryFr(specie), findEn(s.genera)?.genus?.replace("Pokémon", "").trim() ?? "");
    push("flavorText", id, "text", extractPokemonDescriptionFr(specie), findEn(s.flavor_text_entries)?.flavor_text ?? "");
  }

  for (const t of dataset.types) {
    push("typeLabels", t.name, "label", t.names.find((n) => n.language.name === "fr")?.name ?? null, findEnName(t.names));
  }

  for (const a of dataset.abilities) {
    push("abilities", a.name, "name", a.names.find((n) => n.language.name === "fr")?.name ?? null, findEnName(a.names));
  }

  // Stat labels are our own UI strings (not PokéAPI); FR_STAT_LABELS is the API source.
  for (const [key, value] of Object.entries(FR_STAT_LABELS)) {
    push("statLabels", key, "label", value, key);
  }

  return gaps;
};

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

// Build-time only. Fetches: every species 1..MAX, the 18 types, and every visible
// (non-hidden) ability referenced by those Pokémon (deduped).
export const fetchFrRawDataset = async (): Promise<FrRawDataset> => {
  const ids = Array.from({ length: MAX_POKEMON_ID_ALLOWED }, (_, i) => i + 1);
  const species: FrSpeciesRaw[] = await Promise.all(ids.map((id) => request(`${POKE_API_URL}pokemon-species/${id}`)));

  const typeList: { results: Array<{ name: string }> } = await request(`${POKE_API_URL}type`);
  const realTypes = typeList.results.filter((t) => !["unknown", "shadow", "stellar"].includes(t.name));
  const types: FrTypeRaw[] = await Promise.all(realTypes.map((t) => request(`${POKE_API_URL}type/${t.name}`)));

  // Collect visible ability slugs from each Pokémon (the /pokemon endpoint, not species).
  const pokemon: Array<{ abilities: Array<{ ability: { name: string }; is_hidden: boolean }> }> = await Promise.all(
    ids.map((id) => request(`${POKE_API_URL}pokemon/${id}`))
  );
  const abilitySlugs = Array.from(
    new Set(pokemon.flatMap((p) => p.abilities.filter((a) => !a.is_hidden).map((a) => a.ability.name)))
  );
  const abilities: FrAbilityRaw[] = await Promise.all(abilitySlugs.map((name) => request(`${POKE_API_URL}ability/${name}`)));

  return { species, types, abilities };
};
