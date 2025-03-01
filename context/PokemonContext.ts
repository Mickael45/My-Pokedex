import { createContext } from "react";

interface IContextProps {
  filteredPokemons: IBasicPokemon[];
  pokemons: IBasicPokemon[];
  setPokemons: (pokemons: IBasicPokemon[]) => void;
}

export default createContext<IContextProps>({
  filteredPokemons: [],
  pokemons: [],
  setPokemons: () => {},
});
