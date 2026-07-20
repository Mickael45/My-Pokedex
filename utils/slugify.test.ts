import { describe, it, expect } from "vitest";
import { slugify, buildSlugIdMap } from "./slugify";

describe("slugify", () => {
  it("lowercases plain names", () => {
    expect(slugify("Bulbizarre")).toBe("bulbizarre");
  });
  it("strips French accents", () => {
    expect(slugify("Électhor")).toBe("electhor");
    expect(slugify("Flabébé")).toBe("flabebe");
    expect(slugify("Métamorph")).toBe("metamorph");
  });
  it("collapses punctuation and spaces to single dashes", () => {
    expect(slugify("M. Mime")).toBe("m-mime");
    expect(slugify("Ho-Oh")).toBe("ho-oh");
    expect(slugify("Porygon-Z")).toBe("porygon-z");
  });
  it("drops gender symbols, collapsing Nidoran forms to the same base", () => {
    expect(slugify("Nidoran♀")).toBe("nidoran");
    expect(slugify("Nidoran♂")).toBe("nidoran");
  });
  it("trims leading/trailing dashes", () => {
    expect(slugify("♂Truc♂")).toBe("truc");
  });
});

describe("buildSlugIdMap", () => {
  it("maps slug↔id both ways", () => {
    const { slugToId, idToSlug } = buildSlugIdMap([
      { id: 1, frName: "Bulbizarre" },
      { id: 145, frName: "Électhor" },
    ]);
    expect(slugToId).toEqual({ bulbizarre: 1, electhor: 145 });
    expect(idToSlug).toEqual({ 1: "bulbizarre", 145: "electhor" });
  });
  it("applies FR_SLUG_OVERRIDES so the Nidoran pair resolves distinctly", () => {
    const { slugToId } = buildSlugIdMap([
      { id: 29, frName: "Nidoran♀" },
      { id: 32, frName: "Nidoran♂" },
    ]);
    expect(slugToId).toEqual({ "nidoran-f": 29, "nidoran-m": 32 });
  });
  it("throws listing the colliding names when two ids share a slug", () => {
    expect(() =>
      buildSlugIdMap([
        { id: 100, frName: "Doublon" },
        { id: 200, frName: "Doublon" },
      ])
    ).toThrow(/collision/i);
  });
});
