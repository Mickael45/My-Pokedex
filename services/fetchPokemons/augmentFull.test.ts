import { describe, it, expect } from "vitest";
import { augmentFullWithFr } from "./fetchPokemonsFr";
const enFull = {
  id: 1, name: "bulbasaur", category: "Seed", description: "A strange seed.",
  abilities: ["Overgrow"], evolutionChain: [{ id: 1, name: "bulbasaur" }, { id: 2, name: "ivysaur" }],
  types: "grass,poison", stats: [], weaknesses: [], defensiveEffectiveness: [], offensiveEffectiveness: [],
  height: 7, weight: 69, pixelImageUrl: "", hdImageUrl: "",
} as unknown as IFullPokemon;
const species = {
  names: [{ language: { name: "fr" }, name: "Bulbizarre" }],
  genera: [{ language: { name: "fr" }, genus: "Pokémon Graine" }],
  flavor_text_entries: [{ language: { name: "fr" }, version: { name: "scarlet" }, flavor_text: "Une graine FR." }],
} as any;
const overrides = { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} };
const maps = { idToFrName: { 1: "Bulbizarre", 2: "Herbizarre" }, idToSlug: { 1: "bulbizarre", 2: "herbizarre" } };

describe("augmentFullWithFr", () => {
  it("attaches resolved fr name/category/description/abilities and localizes the evolution chain", () => {
    const r = augmentFullWithFr(enFull, species, ["Engrais"], maps, overrides);
    expect(r.frName).toBe("Bulbizarre");
    expect(r.frCategory).toBe("Graine");
    expect(r.frDescription).toBe("Une graine FR.");
    expect(r.frAbilities).toEqual(["Engrais"]);
    expect(r.evolutionChain[1]).toMatchObject({ id: 2, frName: "Herbizarre", slug: "herbizarre" });
  });
  it("blanks the EN-only fields the FR page never reads so they don't ship in __NEXT_DATA__", () => {
    const r = augmentFullWithFr(enFull, species, ["Engrais"], maps, overrides);
    // Blanked: FR detail page renders frDescription/frCategory/frAbilities instead.
    expect(r.description).toBe("");
    expect(r.category).toBe("");
    expect(r.abilities).toEqual([]);
    // Each evolution stage's EN name is blanked (EvolutionStageFr uses frName).
    expect(r.evolutionChain.every((stage) => stage.name === "")).toBe(true);
    // KEPT: the GEO opener renders the English name as the "(anglais : …)" anchor.
    expect(r.name).toBe("bulbasaur");
    // The fr* fields the page actually reads stay populated.
    expect(r.frName).toBe("Bulbizarre");
    expect(r.frCategory).toBe("Graine");
    expect(r.frDescription).toBe("Une graine FR.");
    expect(r.frAbilities).toEqual(["Engrais"]);
  });
  it("throws when a required fr field is missing from both API and overrides", () => {
    const noFr = { ...species, flavor_text_entries: [{ language: { name: "en" }, version: { name: "red" }, flavor_text: "x" }] };
    expect(() => augmentFullWithFr(enFull, noFr, ["Engrais"], maps, overrides)).toThrow();
  });
});
