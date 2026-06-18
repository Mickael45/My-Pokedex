import { formatNumberToMatchLength } from "../stringManipulation";
import typesInteractionData from "../../constants/TypeInteractions.json";
import { EvolutionData, EvolvesTo, Specie, IPokemonResponseType } from "./types";
import EffectivenessTypeToDamageFactorHashMapType from "../../constants/EffectivenessTypeToDamageFactorHashMap";
import pokemonTypesColor from "../../constants/TypesColor.json";
import {
  extractStatsFromPokemon,
  extractAbilitiesFromPokemon,
  extractPokemonDescription,
  extractPokemonCategory,
  extractTypeName,
} from "./extractors";
import { BASIC_PIC, FULL_PIC, PIXELATED } from "../../constants/FetchPokemons";

type PIC_TYPE = typeof BASIC_PIC | typeof FULL_PIC | typeof PIXELATED;

const isVeryOrSuperEffectiveTypes = (value: PokemonInteractionTypeHash) => {
  const firstValue = Object.values(value)[0] as PokemonEffectivenessType;

  return firstValue === "very effective" || firstValue === "super effective";
};

const createWeaknessInteractionTypeObj = (value: PokemonInteractionTypeHash) => {
  const type = Object.keys(value)[0] as PokemonType;
  const interactionType = Object.values(value)[0] as PokemonEffectivenessType;
  const factor = EffectivenessTypeToDamageFactorHashMapType[interactionType];

  return { type, factor };
};

const getPokemonWeaknesses = (types: string) => {
  const areTypesEqual = ({ key }: IPokemonInteractionTypes) => key === types;

  const typeInteractions = typesInteractionData.flat().find(areTypesEqual);
  const weakInteractionTypes = typeInteractions?.values
    .filter(isVeryOrSuperEffectiveTypes)
    .map(createWeaknessInteractionTypeObj);

  return weakInteractionTypes || [];
};

// Defending effectiveness (damage taken) against all 18 attacking types.
export const getPokemonDefensiveEffectiveness = (types: string): ITypeEffectiveness[] => {
  const areTypesEqual = ({ key }: IPokemonInteractionTypes) => key === types;
  const typeInteractions = typesInteractionData.flat().find(areTypesEqual);

  if (!typeInteractions) {
    return [];
  }

  return typeInteractions.values.map((value: PokemonInteractionTypeHash) => {
    const type = Object.keys(value)[0];
    const effectiveness = Object.values(value)[0] as PokemonEffectivenessType;

    return { type, factor: EffectivenessTypeToDamageFactorHashMapType[effectiveness] };
  });
};

// Offensive effectiveness (damage dealt) of this Pokemon's STAB types against all
// 18 defending types — best multiplier across its types (best STAB coverage).
export const getPokemonOffensiveEffectiveness = (types: string): ITypeEffectiveness[] => {
  const attackers = types.split(",");
  const allEntries = typesInteractionData.flat();
  const ownDefence = allEntries.find(({ key }) => key === types);
  const defenderTypes = ownDefence ? ownDefence.values.map((value) => Object.keys(value)[0]) : [];

  return defenderTypes.map((defender) => {
    const defenderEntry = allEntries.find(({ key }) => key === defender);
    const factors = attackers.map((attacker) => {
      const hash = defenderEntry?.values.find((value) => Object.keys(value)[0] === attacker);
      const effectiveness = (hash ? Object.values(hash)[0] : "normal effectiveness") as PokemonEffectivenessType;

      return EffectivenessTypeToDamageFactorHashMapType[effectiveness];
    });

    return { type: defender, factor: Math.max(...factors) as DamageFactor };
  });
};

export const getPokemonPrimaryTypeColor = (types: string) => {
  const primaryType = types.split(",")[0];
  const castedPokemonTypesColor = pokemonTypesColor as HashMap;

  return castedPokemonTypesColor[primaryType];
};

export type EvolutionChainEntry = { url: string; level: number | null };

export const formatPokemonEvolutionChain = (
  node: EvolutionData | EvolvesTo,
  level: number | null = null,
  evolutionChain: EvolutionChainEntry[] = []
): EvolutionChainEntry[] => {
  evolutionChain.push({ url: node.species.url, level });
  node.evolves_to.forEach((evolution) =>
    formatPokemonEvolutionChain(evolution, evolution.evolution_details?.[0]?.min_level ?? null, evolutionChain)
  );

  return evolutionChain;
};

// Images are self-hosted under public/pokemon by scripts/downloadPokemonImages.mjs
// (run via the prebuild/predev hooks), so these resolve to same-origin static files
// that ship with the SSG output instead of runtime CDN fetches. The folder layout
// and padding here MUST match that download script.
const createImageUrl = (id: number, imgType: PIC_TYPE = PIXELATED) => {
  if (imgType === PIXELATED) {
    return `/pokemon/pixel/${id}.webp`;
  }
  const folder = imgType === BASIC_PIC ? "basic" : "full";
  return `/pokemon/${folder}/${formatNumberToMatchLength(id)}.webp`;
};

export const formatToBasicPokemon = (pokemon: IPokemonResponseType): IBasicPokemon => {
  const { id, name, types } = pokemon;
  const pixelImageUrl = createImageUrl(id);
  const hdImageUrl = createImageUrl(id, BASIC_PIC);
  const typesName = types.map(extractTypeName).join(",");
  // Stats are already on the /pokemon response, so SSG can include them at no
  // extra fetch cost. Shipped as a compact [hp, attack, defense, speed] tuple so
  // the payload for all 1025 Pokemon stays small.
  const fullStats = extractStatsFromPokemon(pokemon);
  const statValue = (label: string) =>
    fullStats.find((stat) => stat.label.toLowerCase() === label)?.value ?? 0;
  const stats: PokemonCardStats = [
    statValue("hp"),
    statValue("attack"),
    statValue("defense"),
    statValue("speed"),
  ];

  return { id, name, pixelImageUrl, hdImageUrl, types: typesName, stats };
};

const extractIdFromUrl = (url: string) => Number(url.split("/").filter(Boolean).pop());

// The pre-evolution shown on the list card, derived from the species response so
// the badge can be part of the SSG payload (no client fetch).
export const formatEvolvesFrom = (species: Specie): IEvolvesFrom | null => {
  const evolvesFrom = species.evolves_from_species;

  if (!evolvesFrom) {
    return null;
  }

  return { name: evolvesFrom.name, image: createImageUrl(extractIdFromUrl(evolvesFrom.url)) };
};

export const formatToFullPokemon = (
  pokemon: IPokemonResponseType,
  evolutionChain: IEvolutionStage[],
  pokemonSpeciesData: Specie
): IFullPokemon => {
  const { height, weight, id } = pokemon;
  const pokemonBasicInfo = formatToBasicPokemon(pokemon);
  const weaknesses = getPokemonWeaknesses(pokemonBasicInfo.types);
  const defensiveEffectiveness = getPokemonDefensiveEffectiveness(pokemonBasicInfo.types);
  const offensiveEffectiveness = getPokemonOffensiveEffectiveness(pokemonBasicInfo.types);
  const stats = extractStatsFromPokemon(pokemon);
  const description = extractPokemonDescription(pokemonSpeciesData);
  const category = extractPokemonCategory(pokemonSpeciesData);
  const abilities = extractAbilitiesFromPokemon(pokemon.abilities);
  const hdImageUrl = createImageUrl(id, FULL_PIC);

  return {
    ...pokemonBasicInfo,
    hdImageUrl,
    stats,
    weaknesses,
    defensiveEffectiveness,
    offensiveEffectiveness,
    height: height * 10,
    weight: weight / 10,
    evolutionChain,
    abilities,
    description,
    category,
  };
};
