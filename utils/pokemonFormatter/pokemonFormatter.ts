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
import {
  BASIC_PIC,
  FULL_PIC,
  PIXELATED,
  POKEMON_BASIC_PIC_URL,
  POKEMON_FULL_PIC_URL,
  POKEMON_PIXEL_PIC_URL,
} from "../../constants/FetchPokemons";

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

export const getPokemonPrimaryTypeColor = (types: string) => {
  const primaryType = types.split(",")[0];
  const castedPokemonTypesColor = pokemonTypesColor as HashMap;

  return castedPokemonTypesColor[primaryType];
};

export const formatPokemonEvolutionChain = ({ evolves_to, species }: EvolutionData, evolutionChain: string[] = []) => {
  const getNestedEvolutionData = (evolution: EvolvesTo) => formatPokemonEvolutionChain(evolution, evolutionChain);

  evolutionChain.push(species.url);
  evolves_to.forEach(getNestedEvolutionData);

  return evolutionChain;
};

const createImageUrl = (id: number, imgType: PIC_TYPE = PIXELATED) => {
  if (imgType === PIXELATED) {
    return `${POKEMON_PIXEL_PIC_URL}${id}.png`;
  }
  return `${imgType === BASIC_PIC ? POKEMON_BASIC_PIC_URL : POKEMON_FULL_PIC_URL}${formatNumberToMatchLength(id)}.png`;
};

export const formatToBasicPokemon = (pokemon: IPokemonResponseType): IBasicPokemon => {
  const { id, name, types } = pokemon;
  const pixelImageUrl = createImageUrl(id);
  const hdImageUrl = createImageUrl(id, BASIC_PIC);
  const typesName = types.map(extractTypeName).join(",");

  return { id, name, pixelImageUrl, hdImageUrl, types: typesName };
};

export const formatToFullPokemon = (
  pokemon: IPokemonResponseType,
  evolutionChain: IBasicPokemon[],
  pokemonSpeciesData: Specie
): IFullPokemon => {
  const { height, weight, id } = pokemon;
  const pokemonBasicInfo = formatToBasicPokemon(pokemon);
  const weaknesses = getPokemonWeaknesses(pokemonBasicInfo.types);
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
    height: height * 10,
    weight: weight / 10,
    evolutionChain,
    abilities,
    description,
    category,
  };
};
