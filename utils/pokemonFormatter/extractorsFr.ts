// French counterparts of extractors.ts. Each returns null (never English) when
// PokéAPI has no French value, so resolveFrField (Task 4) can consult the
// overrides file and, failing that, throw. `types` is intentionally NOT handled
// here — type text is a display-time label lookup, never derived per-species.

export type NameEntryFr = { language: { name: string }; name: string };
export type GeneraEntryFr = { language: { name: string }; genus: string };
export type FlavorTextEntryFr = {
  language: { name: string };
  version: { name: string };
  flavor_text: string;
};
export type SpecieFr = {
  names: readonly NameEntryFr[];
  genera: readonly GeneraEntryFr[];
  flavor_text_entries: readonly FlavorTextEntryFr[];
};

const isFr = (entry: { language: { name: string } }) => entry.language.name === "fr";

// Main-series versions that carry French flavor text, newest → oldest. Index 0 =
// most recent. Unknown versions get Infinity so any ranked entry beats them; when
// NO entry is ranked we fall back to the last fr entry in array order.
export const VERSION_RECENCY: string[] = [
  "scarlet", "violet",
  "legends-arceus",
  "brilliant-diamond", "shining-pearl",
  "sword", "shield",
  "lets-go-pikachu", "lets-go-eevee",
  "ultra-sun", "ultra-moon",
  "sun", "moon",
  "omega-ruby", "alpha-sapphire",
  "x", "y",
  "black-2", "white-2",
  "black", "white",
  "heartgold", "soulsilver",
  "platinum",
  "diamond", "pearl",
];

const rank = (version: string) => {
  const i = VERSION_RECENCY.indexOf(version);
  return i === -1 ? Infinity : i;
};

// Pokédex flavor text carries newlines, form-feeds (\f) and soft hyphens
// (\u00AD, a line-break hint) as layout artifacts — flatten them to spaces.
const normalizeFlavor = (text: string) => text.replace(/[\n\r\f\u00AD]/g, " ").replace(/\s+/g, " ").trim();

export const extractPokemonNameFr = (species: SpecieFr): string | null =>
  species.names.find(isFr)?.name ?? null;

export const extractPokemonCategoryFr = (species: SpecieFr): string | null => {
  const genus = species.genera.find(isFr)?.genus;
  if (!genus) return null;
  return genus.replace("Pokémon", "").trim();
};

export const extractPokemonDescriptionFr = (species: SpecieFr): string | null => {
  const frEntries = species.flavor_text_entries.filter(isFr);
  if (!frEntries.length) return null;

  const allUnknown = frEntries.every((e) => rank(e.version.name) === Infinity);
  const chosen = allUnknown
    ? frEntries[frEntries.length - 1]
    : frEntries.reduce((best, e) => (rank(e.version.name) < rank(best.version.name) ? e : best));

  return normalizeFlavor(chosen.flavor_text);
};
