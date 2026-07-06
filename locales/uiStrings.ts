import { Locale } from "../constants/Locale";

export type UiStrings = {
  navPokedex: string;
  navTypeChart: string;
  typeChartLandingTitle: string;
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
  detailPokedexEntry: string;
  detailBaseStats: string;
  detailProfile: string;
  detailTypeEffectiveness: string;
  detailDamageTaken: string;
  detailDamageDealt: string;
  detailEvolution: string;
  detailHeight: string;
  detailWeight: string;
  detailCategory: string;
  detailAbilities: string;
  detailPrev: string;
  detailNext: string;
  detailLevelPrefix: string;
  typeChartDefending: string;
  typeChartAttacking: string;
  typeChartDefendingDesc: string;
  typeChartAttackingDesc: string;
  typeChartNeutralOnly: string;
  typeChartPrompt: string;
  typePickerLabel: string;
  typePickerHint: string;
};

export const UI_STRINGS: Record<Locale, UiStrings> = {
  en: {
    navPokedex: "Pokédex",
    navTypeChart: "Type Chart",
    typeChartLandingTitle: "Pokémon Type Interactions",
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
    detailPokedexEntry: "Pokedex entry",
    detailBaseStats: "Base stats",
    detailProfile: "Profile",
    detailTypeEffectiveness: "Type effectiveness",
    detailDamageTaken: "Damage taken",
    detailDamageDealt: "Damage dealt",
    detailEvolution: "Evolution",
    detailHeight: "Height",
    detailWeight: "Weight",
    detailCategory: "Category",
    detailAbilities: "Abilities",
    detailPrev: "< Prev",
    detailNext: "Next >",
    detailLevelPrefix: "Lv.",
    typeChartDefending: "Defending",
    typeChartAttacking: "Attacking",
    typeChartDefendingDesc: "Damage {combo} takes from each attacking type, worst matchups first.",
    typeChartAttackingDesc: "Damage {combo} deals to each type with its best move, best matchups first.",
    typeChartNeutralOnly: "Only neutral matchups for this selection.",
    typeChartPrompt: "Select a type (or two) above to see its matchups.",
    typePickerLabel: "Type(s)",
    typePickerHint: "select up to 2",
  },
  fr: {
    navPokedex: "Pokédex",
    navTypeChart: "Table des types",
    typeChartLandingTitle: "Interactions de types Pokémon",
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
    detailPokedexEntry: "Description Pokédex",
    detailBaseStats: "Statistiques de base",
    detailProfile: "Profil",
    detailTypeEffectiveness: "Efficacité des types",
    detailDamageTaken: "Dégâts subis",
    detailDamageDealt: "Dégâts infligés",
    detailEvolution: "Évolution",
    detailHeight: "Taille",
    detailWeight: "Poids",
    detailCategory: "Catégorie",
    detailAbilities: "Talents",
    detailPrev: "< Préc.",
    detailNext: "Suiv. >",
    detailLevelPrefix: "Niv.",
    typeChartDefending: "Défense",
    typeChartAttacking: "Attaque",
    typeChartDefendingDesc: "Dégâts subis par {combo} de la part de chaque type attaquant, pires en premier.",
    typeChartAttackingDesc: "Dégâts infligés par {combo} à chaque type avec sa meilleure attaque, meilleurs en premier.",
    typeChartNeutralOnly: "Uniquement des matchups neutres pour cette sélection.",
    typeChartPrompt: "Sélectionnez un ou deux types ci-dessus pour voir ses matchups.",
    typePickerLabel: "Type(s)",
    typePickerHint: "2 max",
  },
};
