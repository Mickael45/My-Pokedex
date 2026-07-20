import { capitalizeFirstLetter, formatNumberToMatchLength } from "./stringManipulation";
import { frGenerationOrdinal } from "../constants/Generations";

// Sum of every base stat (all six on the /pokemon response), i.e. the Base Stat
// Total. A per-Pokémon number that makes each meta description genuinely distinct.
export const baseStatTotal = (stats: Array<{ value: number }>): number =>
  stats.reduce((sum, stat) => sum + stat.value, 0);

// English detail-page meta description. Composed from facts that all vary per
// Pokémon (genus, types, generation, base-stat total) so every one of the ~1025
// pages is unique and ~150–165 chars — clearing Bing's "identical / too short"
// descriptions warning — without reproducing any verbatim franchise flavor text.
// `category` is the genus with "Pokémon" already stripped (e.g. "Seed"); it can be
// empty, in which case the genus clause is dropped.
export const enDetailDescription = ({
  name,
  category,
  types,
  id,
  gen,
  bst,
}: {
  name: string;
  category: string;
  types: string;
  id: number;
  gen: number;
  bst: number;
}): string => {
  const displayName = capitalizeFirstLetter(name);
  const typesLabel = types
    .split(",")
    .map(capitalizeFirstLetter)
    .join("/");
  const genus = category.trim() ? `the ${category.trim()} Pokémon ` : "";
  return `${displayName}, ${genus}(#${formatNumberToMatchLength(id)}) — ${typesLabel} type, Generation ${gen}, ${bst} base-stat total. Full base stats, type weaknesses, abilities and evolution line.`;
};

// French detail-page meta description. Same fact-composed strategy as the English
// one; `displayName` is the resolved French name, `category` the French genus with
// "Pokémon" stripped (e.g. "Graine"), and `typesLabel` the already-localized types
// joined with "/". Kept parallel so both locales clear the same Bing warnings.
export const frDetailDescription = ({
  displayName,
  category,
  typesLabel,
  id,
  gen,
  bst,
}: {
  displayName: string;
  category: string;
  typesLabel: string;
  id: number;
  gen: number;
  bst: number;
}): string => {
  const genus = category.trim() ? `le Pokémon ${category.trim()} ` : "";
  return `${displayName}, ${genus}(#${formatNumberToMatchLength(id)}) — type ${typesLabel}, ${frGenerationOrdinal(gen)} génération, ${bst} points de stats de base. Statistiques, faiblesses, talents et évolutions.`;
};
