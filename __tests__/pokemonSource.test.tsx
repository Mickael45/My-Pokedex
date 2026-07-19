import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import usePokemons from "../hooks/usePokemons";

// The source list (`pokemons`) is what useFiltering/sorting derive the displayed
// cards from — including each card's detail-page slug. It MUST track the current
// locale's list: the home page seeds it with its per-locale SSG list, so a user
// who lands on the English home and then switches to /fr must end up with the
// French list (French slugs) as the source. Regression guard for the bug where
// the source seeded once and locked to whichever locale mounted first, leaving
// French cards linking to English slugs (/fr/pokemon/bulbasaur -> 404).
const listEn = [{ id: 1, name: "bulbasaur", slug: "bulbasaur", types: "grass", stats: [45, 49, 49, 45] }] as unknown as IBasicPokemon[];
const listFr = [{ id: 1, name: "bulbasaur", frName: "Bulbizarre", slug: "bulbizarre", types: "grass", stats: [45, 49, 49, 45] }] as unknown as IBasicPokemon[];

describe("usePokemons", () => {
  it("re-seeds the source list on every setPokemons call so a locale switch is not stale", () => {
    const { result } = renderHook(() => usePokemons());

    act(() => result.current.setPokemons(listEn));
    expect(result.current.pokemons).toBe(listEn);

    // Navigating to the other locale's home sets its own list — the source must follow.
    act(() => result.current.setPokemons(listFr));
    expect(result.current.pokemons).toBe(listFr);
  });

  it("keeps the source list intact when only the displayed list changes", () => {
    const { result } = renderHook(() => usePokemons());

    act(() => result.current.setPokemons(listEn));
    // A filter/sort narrows the DISPLAY without destroying the source it filters against.
    act(() => result.current.setFilteredPokemons([]));

    expect(result.current.pokemons).toBe(listEn);
    expect(result.current.filteredPokemons).toEqual([]);
  });
});
