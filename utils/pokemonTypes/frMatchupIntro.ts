import { MatchupSummary } from "./matchups";

// French list join using "et": ["A"]→"A"; ["A","B"]→"A et B";
// ["A","B","C"]→"A, B et C"; []→"".
export const frFormatList = (items: string[]): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
};

export interface FrMatchupIntro {
  title: string;
  paragraph: string;
}

// PURE. `label` is the already-localized heading label ("Feu / Eau"); `summary`
// holds ENGLISH type names; `typeLabel` maps an english type → French label.
// Mirrors the EN three-sentence structure (defense / guard / offense) in French.
export const frMatchupIntro = (
  label: string,
  summary: MatchupSummary,
  typeLabel: (t: string) => string
): FrMatchupIntro => {
  const { weakTo, resists, immuneTo, strongAgainst } = summary;
  const fr = (arr: string[]) => arr.map(typeLabel);

  const title = `${label} — Faiblesses & Résistances`;

  const defense = weakTo.length
    ? `Les Pokémon ${label} subissent des dégâts super efficaces de la part des types ${frFormatList(fr(weakTo))}.`
    : `Les Pokémon ${label} n'ont pas de faiblesse de type commune.`;

  const guardParts: string[] = [];
  if (resists.length) guardParts.push(`résistent à ${frFormatList(fr(resists))}`);
  if (immuneTo.length) guardParts.push(`sont immunisés contre ${frFormatList(fr(immuneTo))}`);
  const guard = guardParts.length ? `Ils ${guardParts.join(" et ")}.` : "";

  const offense = strongAgainst.length
    ? `En attaque, leur meilleure couverture est contre ${frFormatList(fr(strongAgainst))}.`
    : `En attaque, ils n'ont pas de couverture super efficace.`;

  const paragraph = `${defense} ${guard} ${offense}`.replace(/\s+/g, " ").trim();

  return { title, paragraph };
};
