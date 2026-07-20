import { describe, it, expect } from "vitest";
import { filterPokemonsByName } from "./filtering";
const mons = [
  { id: 145, name: "zapdos", frName: "Électhor" },
  { id: 1, name: "bulbasaur", frName: "Bulbizarre" },
] as unknown as IBasicPokemon[];
describe("filterPokemonsByName (fr-aware)", () => {
  it("matches accent-stripped French name", () => {
    expect(filterPokemonsByName(mons, "electhor").map((m) => m.id)).toEqual([145]);
    expect(filterPokemonsByName(mons, "élec").map((m) => m.id)).toEqual([145]);
  });
  it("still matches the English name as fallback", () => {
    expect(filterPokemonsByName(mons, "bulba").map((m) => m.id)).toEqual([1]);
  });
});
