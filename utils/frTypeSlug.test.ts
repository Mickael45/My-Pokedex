import { describe, it, expect } from "vitest";
import { frTypeSlug, engTypeFromFrSlug, toFrTypeSlug, parseFrTypeSlug, allFrTypeSlugs } from "./frTypeSlug";
describe("frTypeSlug layer", () => {
  it("maps english type → french slug", () => {
    expect(frTypeSlug("fire")).toBe("feu");
    expect(frTypeSlug("electric")).toBe("electrik");
    expect(frTypeSlug("dark")).toBe("tenebres");
  });
  it("reverses french slug → english type", () => {
    expect(engTypeFromFrSlug("feu")).toBe("fire");
    expect(engTypeFromFrSlug("electrik")).toBe("electric");
    expect(engTypeFromFrSlug("nope")).toBeNull();
  });
  it("round-trips a two-type combo, sorted by french slug, returning english types", () => {
    const slug = toFrTypeSlug(["water", "fire"]); // feu, eau → sorted "eau-feu"
    expect(slug).toBe("eau-feu");
    expect(parseFrTypeSlug(slug)).toEqual(["fire", "water"].sort());
  });
  it("rejects invalid or oversized slugs", () => {
    expect(parseFrTypeSlug("feu-eau-plante")).toEqual([]);
    expect(parseFrTypeSlug("feu-xyz")).toEqual([]);
  });
  it("allFrTypeSlugs has 18 singles + 153 pairs = 171", () => {
    expect(allFrTypeSlugs()).toHaveLength(171);
  });
});
