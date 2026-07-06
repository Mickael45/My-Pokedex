// constants/FrTypeLabels.ts
// Static, client-safe source of truth for French type labels. The nav type
// filter renders client-side, so it maps the English type slug through this
// fixed 18-entry set (not the build-time resolver). Values are PLACEHOLDERS
// pending Mickael's review of the official French labels.
export const FR_TYPE_LABELS: Record<string, string> = {
  normal: "Normal",
  fire: "Feu",
  water: "Eau",
  electric: "Électrik",
  grass: "Plante",
  ice: "Glace",
  fighting: "Combat",
  poison: "Poison",
  ground: "Sol",
  flying: "Vol",
  psychic: "Psy",
  bug: "Insecte",
  rock: "Roche",
  ghost: "Spectre",
  dragon: "Dragon",
  dark: "Ténèbres",
  steel: "Acier",
  fairy: "Fée",
};
