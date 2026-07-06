import { Locale } from "../constants/Locale";

export type UiStrings = {
  navPokedex: string;
  navTypeChart: string;
  navFilterAria: string;
  navOptionsAria: string;
  searchPlaceholder: string;
  searchSubmit: string;
  filterByType: string;
  cookieSettings: string;
  emptyList: string;
  homeTitleH1: string;
  homeIntro: string;
  sortLabel: string;
  sortAscNumber: string;
  sortDescNumber: string;
  sortAscName: string;
  sortDescName: string;
  footerAbout: string;
  footerPrivacy: string;
  footerContact: string;
  footerTerms: string;
  footerNavLabel: string;
  footerDisclaimer: string;
  // extend in later tasks (detail pane titles…)
};

export const UI_STRINGS: Record<Locale, UiStrings> = {
  en: {
    navPokedex: "Pokédex",
    navTypeChart: "Type Chart",
    navFilterAria: "Filter by type",
    navOptionsAria: "Options",
    searchPlaceholder: "Search a Pokemon by name or id",
    searchSubmit: "Submit",
    filterByType: "Filter Pokémon by type",
    cookieSettings: "Cookie settings",
    emptyList: "No Pokemon Found...",
    homeTitleH1: "Pokédex",
    homeIntro:
      "Search every Pokémon by name or National Pokédex number, filter the list by type, and open any entry for its base stats, type weaknesses and resistances, abilities and full evolution line.",
    sortLabel: "Sort Pokémon list",
    sortAscNumber: "asc. number",
    sortDescNumber: "desc. number",
    sortAscName: "A-Z",
    sortDescName: "Z-A",
    footerAbout: "About",
    footerPrivacy: "Privacy",
    footerContact: "Contact",
    footerTerms: "Terms",
    footerNavLabel: "Footer",
    footerDisclaimer:
      "is an unofficial fan-made reference. It is not affiliated with, endorsed by, or sponsored by Nintendo, Game Freak, or The Pokémon Company. Pokémon and Pokémon character names are trademarks of Nintendo. All stat tables and type-matchup data on this site are independently compiled facts.",
  },
  fr: {
    navPokedex: "Pokédex",
    navTypeChart: "Table des types",
    navFilterAria: "Filtrer par type",
    navOptionsAria: "Options",
    searchPlaceholder: "Rechercher un Pokémon par nom ou numéro",
    searchSubmit: "Envoyer",
    filterByType: "Filtrer les Pokémon par type",
    cookieSettings: "Paramètres des cookies",
    emptyList: "Aucun Pokémon trouvé...",
    homeTitleH1: "Pokédex",
    homeIntro:
      "Recherchez chaque Pokémon par nom ou numéro du Pokédex National, filtrez la liste par type, et ouvrez une fiche pour ses statistiques de base, faiblesses et résistances de type, talents et chaîne d'évolution complète.",
    sortLabel: "Trier la liste des Pokémon",
    sortAscNumber: "n° croissant",
    sortDescNumber: "n° décroissant",
    sortAscName: "A-Z",
    sortDescName: "Z-A",
    footerAbout: "À propos",
    footerPrivacy: "Confidentialité",
    footerContact: "Contact",
    footerTerms: "Conditions",
    footerNavLabel: "Pied de page",
    footerDisclaimer:
      "est une référence non officielle créée par des fans. Ce site n'est ni affilié, ni approuvé, ni sponsorisé par Nintendo, Game Freak ou The Pokémon Company. Pokémon et les noms des personnages Pokémon sont des marques de Nintendo. Tous les tableaux de statistiques et les données de correspondances de types de ce site sont des faits compilés de manière indépendante.",
  },
};
