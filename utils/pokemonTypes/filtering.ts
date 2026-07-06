import { normalizeSearch } from "../normalizeSearch";

export const filterPokemonsByTypes = (pokemons: IBasicPokemon[], types: string) => {
  const doestTypesContainType = (pokemon: IBasicPokemon) =>
    pokemon.types.includes(types) || pokemon.types.split(",").reverse().join(",").includes(types);

  const filteredPokemons = pokemons.filter(doestTypesContainType);

  return filteredPokemons;
};

export const filterPokemonsByName = (pokemons: IBasicPokemon[], value: string) => {
  const q = normalizeSearch(value);
  const matches = (pokemon: IBasicPokemon) =>
    normalizeSearch(pokemon.name).includes(q) ||
    (pokemon.frName ? normalizeSearch(pokemon.frName).includes(q) : false);

  return pokemons.filter(matches);
};

export const filterPokemonsById = (pokemons: IBasicPokemon[], id: string) => {
  const doesPokemonIdMatchWithId = (pokemon: IBasicPokemon) => pokemon.id === +id;

  return pokemons.filter(doesPokemonIdMatchWithId);
};

export const filterByMonoType = (filters: string[], type: PokemonType) =>
  type.includes(`${filters},`) || type === filters[0];

export const filterByMultiType = (filters: string[], type: PokemonType) => type.includes(filters.join(","));
