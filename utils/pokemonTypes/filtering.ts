export const filterPokemonsByTypes = (pokemons: IBasicPokemon[], types: string) => {
  const doestTypesContainType = (pokemon: IBasicPokemon) =>
    pokemon.types.includes(types) || pokemon.types.split(",").reverse().join(",").includes(types);

  const filteredPokemons = pokemons.filter(doestTypesContainType);

  return filteredPokemons;
};

export const filterPokemonsByName = (pokemons: IBasicPokemon[], value: string) => {
  const doValueAndPokemonNameMatchPartially = (pokemon: IBasicPokemon) => pokemon.name.includes(value);

  return pokemons.filter(doValueAndPokemonNameMatchPartially);
};

export const filterPokemonsById = (pokemons: IBasicPokemon[], id: string) => {
  const doesPokemonIdMatchWithId = (pokemon: IBasicPokemon) => pokemon.id === +id;

  return pokemons.filter(doesPokemonIdMatchWithId);
};

export const filterByMonoType = (filters: string[], type: PokemonType) =>
  type.includes(`${filters},`) || type === filters[0];

export const filterByMultiType = (filters: string[], type: PokemonType) => type.includes(filters.join(","));
