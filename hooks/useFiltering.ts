import { TYPES, ID, NAME } from "../constants/QueryTypes";
import useQueryParams from "./useQueryParams";
import { filterPokemonsByTypes, filterPokemonsByName, filterPokemonsById } from "../utils/pokemonTypes/filtering";
import { useContext, useEffect } from "react";
import PokemonContext from "../context/PokemonContext";

const filterHashMap: { [key: string]: (pokemons: IBasicPokemon[], value: string) => IBasicPokemon[] } = {
  [TYPES]: filterPokemonsByTypes,
  [ID]: filterPokemonsById,
  [NAME]: filterPokemonsByName,
};

const useFiltering = () => {
  const filters = useQueryParams();
  const { filteredPokemons, pokemons, setPokemons } = useContext(PokemonContext);

  const areThereAnyPokemons = () => pokemons.length > 0;

  const areThereAnyFilters = () => filters.length > 0;

  const filterPokemonsByFilterType = ({ type, value }: QueryObj) => filterHashMap[type](pokemons, value);

  const filterPokemons = () => {
    if (!areThereAnyPokemons()) {
      return;
    }

    if (!areThereAnyFilters()) {
      setPokemons(pokemons);
      return;
    }

    setPokemons(filters.flatMap(filterPokemonsByFilterType));
  };

  useEffect(filterPokemons, [filters, pokemons]);

  return filteredPokemons;
};

export default useFiltering;
