import { describe, it, expect } from "vitest";
import { augmentBasicWithFr } from "./fetchPokemonsFr";
const basic = { id: 1, name: "bulbasaur", types: "grass,poison", pixelImageUrl: "", hdImageUrl: "", stats: [45,49,49,45] } as IBasicPokemon;
const species = { names: [{ language: { name: "fr" }, name: "Bulbizarre" }], genera: [], flavor_text_entries: [] } as any;
describe("augmentBasicWithFr", () => {
  it("attaches resolved frName and slug", () => {
    const r = augmentBasicWithFr(basic, species, "bulbizarre", { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} });
    expect(r.frName).toBe("Bulbizarre");
    expect(r.slug).toBe("bulbizarre");
    expect(r.id).toBe(1);
  });
  it("throws when neither PokéAPI nor overrides has the fr name", () => {
    const noFr = { names: [{ language: { name: "en" }, name: "Bulbasaur" }], genera: [], flavor_text_entries: [] } as any;
    expect(() => augmentBasicWithFr(basic, noFr, "x", { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} })).toThrow();
  });
});
