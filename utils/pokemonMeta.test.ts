import { describe, it, expect } from "vitest";
import { baseStatTotal, enDetailDescription, frDetailDescription } from "./pokemonMeta";

describe("baseStatTotal", () => {
  it("sums every stat value", () => {
    expect(baseStatTotal([{ value: 45 }, { value: 49 }, { value: 65 }])).toBe(159);
  });
  it("is 0 for no stats", () => {
    expect(baseStatTotal([])).toBe(0);
  });
});

const bulbasaur = { name: "bulbasaur", category: "Seed", types: "grass,poison", id: 1, gen: 1, bst: 318 };

describe("enDetailDescription", () => {
  it("composes a unique, fact-rich description in the SEO length window", () => {
    const desc = enDetailDescription(bulbasaur);
    expect(desc).toContain("Bulbasaur");
    expect(desc).toContain("Seed Pokémon");
    expect(desc).toContain("Grass/Poison type");
    expect(desc).toContain("Generation 1");
    expect(desc).toContain("318 base-stat total");
    // Bing flags descriptions that are too short; keep them comfortably long
    // but under the ~160-char SERP truncation point.
    expect(desc.length).toBeGreaterThanOrEqual(140);
    expect(desc.length).toBeLessThanOrEqual(165);
  });

  it("pads the id to three digits", () => {
    expect(enDetailDescription(bulbasaur)).toContain("(#001)");
  });

  it("drops the genus clause when the category is empty", () => {
    const desc = enDetailDescription({ ...bulbasaur, category: "" });
    expect(desc).not.toContain("Pokémon —");
    expect(desc).toContain("Bulbasaur, (#001)");
  });

  it("produces distinct descriptions for distinct Pokémon (no duplicate-description penalty)", () => {
    const a = enDetailDescription(bulbasaur);
    const b = enDetailDescription({ name: "charmander", category: "Lizard", types: "fire", id: 4, gen: 1, bst: 309 });
    expect(a).not.toEqual(b);
  });
});

describe("frDetailDescription", () => {
  it("composes the French equivalent in the length window", () => {
    const desc = frDetailDescription({
      displayName: "Bulbizarre",
      category: "Graine",
      typesLabel: "Plante/Poison",
      id: 1,
      gen: 1,
      bst: 318,
    });
    expect(desc).toContain("Bulbizarre");
    expect(desc).toContain("le Pokémon Graine");
    expect(desc).toContain("type Plante/Poison");
    expect(desc).toContain("1re génération");
    expect(desc).toContain("318 points de stats de base");
    expect(desc.length).toBeGreaterThanOrEqual(140);
    expect(desc.length).toBeLessThanOrEqual(165);
  });
});
