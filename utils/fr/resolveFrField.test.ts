import { describe, it, expect } from "vitest";
import { resolveFrField, collectFrGap, FrCoverageError } from "./resolveFrField";

const overrides = { flavorText: { "906": { text: "Texte de secours." } } };

describe("resolveFrField", () => {
  it("returns the PokéAPI value when present", () => {
    expect(resolveFrField({ entityType: "names", id: "1", field: "name", apiValue: "Bulbizarre", overrides })).toBe("Bulbizarre");
  });
  it("falls back to the overrides file when the API value is missing", () => {
    expect(resolveFrField({ entityType: "flavorText", id: "906", field: "text", apiValue: null, overrides })).toBe("Texte de secours.");
  });
  it("treats empty/whitespace API values as missing", () => {
    expect(resolveFrField({ entityType: "flavorText", id: "906", field: "text", apiValue: "   ", overrides })).toBe("Texte de secours.");
  });
  it("throws FrCoverageError when neither source has a value", () => {
    expect(() => resolveFrField({ entityType: "flavorText", id: "999", field: "text", apiValue: null, overrides })).toThrow(FrCoverageError);
  });
});

describe("collectFrGap", () => {
  it("returns null when the field resolves", () => {
    expect(collectFrGap({ entityType: "names", id: "1", field: "name", apiValue: "Bulbizarre", overrides })).toBeNull();
  });
  it("returns a gap descriptor when the field would throw", () => {
    expect(collectFrGap({ entityType: "flavorText", id: "999", field: "text", apiValue: null, overrides })).toEqual({ entityType: "flavorText", id: "999", field: "text" });
  });
});
