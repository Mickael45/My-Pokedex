import { useEffect, useState } from "react";
import { fetchPokemonDetailsByNameOrId } from "../services/fetchPokemons/fetchPokemons";

/**
 * Client-side fetch of a single Pokemon's full details (stats, evolution chain, ...).
 * Used by the list card so it can render stat bars/HP that aren't part of the
 * lightweight `IBasicPokemon` payload the list page is built from.
 */
export const usePokemonDetails = (id: number) => {
  const [details, setDetails] = useState<IFullPokemon | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchPokemonDetailsByNameOrId(id.toString())
      .then((data) => isActive && setDetails(data))
      .catch(() => isActive && setDetails(null));

    return () => {
      isActive = false;
    };
  }, [id]);

  return details;
};
