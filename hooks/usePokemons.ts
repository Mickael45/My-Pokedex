import { useState } from "react";

// Two lists: the `pokemons` SOURCE (the full per-locale list) and the
// `filteredPokemons` DISPLAY (what the grid currently shows). `setPokemons`
// replaces the source — the home page calls it with its own locale's SSG list,
// so navigating EN <-> FR re-seeds the source instead of locking it to whichever
// locale mounted first (that stale-source bug left French cards linking to
// English slugs, e.g. /fr/pokemon/bulbasaur -> 404). `setFilteredPokemons`
// updates only the display (search, type filter, sort), leaving the source
// intact to keep filtering against.
const usePokemons = () => {
  const [pokemons, setPokemons] = useState<IBasicPokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<IBasicPokemon[]>([]);

  return { pokemons, filteredPokemons, setPokemons, setFilteredPokemons };
};

export default usePokemons;
