import { capitalizeFirstLetter } from "../stringManipulation";
import { TypeData, Type, Stat, Ability, FlavorTextEntry, GeneraEntry, Specie, IPokemonResponseType } from "./types";

const findEnglishEntry = (entry: FlavorTextEntry | GeneraEntry) => entry.language.name === "en";

const statLabelMapper: HashMap = {
  "special attack": "spe. Att.",
  attack: "attack",
  defense: "defense",
  "special defense": "spe. Def.",
  hp: "hp",
  speed: "speed",
};

export const extractStatsFromPokemon = ({ stats }: IPokemonResponseType) => {
  const formatStatLabel = (statLabel: string) => capitalizeFirstLetter(statLabelMapper[statLabel.replace("-", " ")]);

  const createStatObj = ({ base_stat, stat }: Stat) => ({
    label: formatStatLabel(stat.name),
    value: base_stat,
  });

  return stats?.map(createStatObj);
};

export const extractAbilitiesFromPokemon = (abilities: Ability[]) => {
  const isAbilityVisible = (ability: Ability) => !ability.is_hidden;
  const formatAbilityName = ({ ability }: Ability) => capitalizeFirstLetter(ability.name.replace("-", " "));

  return abilities.filter(isAbilityVisible).map(formatAbilityName);
};

export const extractTypeName = (type: Type) => type.type.name;

export const extractPokemonDescription = (pokemonSpeciesData: Specie) =>
  pokemonSpeciesData.flavor_text_entries.find(findEnglishEntry)?.flavor_text || "";

export const extractPokemonCategory = (pokemonSpeciesData: Specie) =>
  pokemonSpeciesData.genera.find(findEnglishEntry)?.genus.replace("Pokémon", "") || "";

export const extractPokemonData = ({ pokemon }: TypeData) => pokemon;
