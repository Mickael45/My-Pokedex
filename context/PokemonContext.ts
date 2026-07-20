import { createContext } from "react";

interface IContextProps {
  filteredPokemons: IBasicPokemon[];
  pokemons: IBasicPokemon[];
  // Replaces the source list (home page, per locale). See hooks/usePokemons.
  setPokemons: (pokemons: IBasicPokemon[]) => void;
  // Replaces only the displayed list (search / type filter / sort).
  setFilteredPokemons: (pokemons: IBasicPokemon[]) => void;
}

export default createContext<IContextProps>({
  filteredPokemons: [],
  pokemons: [],
  setPokemons: () => {},
  setFilteredPokemons: () => {},
});
