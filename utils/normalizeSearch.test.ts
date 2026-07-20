import { describe, it, expect } from "vitest";
import { normalizeSearch } from "./normalizeSearch";
describe("normalizeSearch", () => {
  it("lowercases and strips accents, keeping spaces", () => {
    expect(normalizeSearch("Électhor")).toBe("electhor");
    expect(normalizeSearch("M. Mime")).toBe("m. mime");
    expect(normalizeSearch("BULBIZARRE")).toBe("bulbizarre");
  });
});
