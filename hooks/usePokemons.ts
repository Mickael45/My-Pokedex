import { useEffect, useState } from "react";

const usePokemons = (): [IBasicPokemon[], IBasicPokemon[], (pokemons: IBasicPokemon[]) => void] => {
  const [pokemons, setPokemons] = useState<IBasicPokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<IBasicPokemon[]>([]);

  const updatePokemons = () => {
    if (!pokemons || pokemons.length === 0) {
      setPokemons(filteredPokemons);
    }
  };

  useEffect(updatePokemons, [filteredPokemons]);

  return [filteredPokemons, pokemons, setFilteredPokemons];
};

export default usePokemons;
