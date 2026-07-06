import { Locale } from "../constants/Locale";

export type UiStrings = {
  navPokedex: string;
  navTypeChart: string;
  searchPlaceholder: string;
  filterByType: string;
  cookieSettings: string;
  emptyList: string;
  homeTitleH1: string;
  homeIntro: string;
  // extend in later tasks (sort labels, footer, detail pane titles…)
};

export const UI_STRINGS: Record<Locale, UiStrings> = {
  en: {
    navPokedex: "Pokédex",
    navTypeChart: "Type Chart",
    searchPlaceholder: "Search a Pokemon by name or id",
    filterByType: "Filter Pokémon by type",
    cookieSettings: "Cookie settings",
    emptyList: "No Pokemon Found...",
    homeTitleH1: "Pokédex",
    homeIntro:
      "Search every Pokémon by name or National Pokédex number, filter the list by type, and open any entry for its base stats, type weaknesses and resistances, abilities and full evolution line.",
  },
  fr: {
    navPokedex: "Pokédex",
    navTypeChart: "Table des types",
    searchPlaceholder: "Rechercher un Pokémon par nom ou numéro",
    filterByType: "Filtrer les Pokémon par type",
    cookieSettings: "Paramètres des cookies",
    emptyList: "Aucun Pokémon trouvé...",
    homeTitleH1: "Pokédex",
    homeIntro:
      "Recherchez chaque Pokémon par nom ou numéro du Pokédex National, filtrez la liste par type, et ouvrez une fiche pour ses statistiques de base, faiblesses et résistances de type, talents et chaîne d'évolution complète.",
  },
};
