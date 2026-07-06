import { describe, it, expect } from "vitest";
import { langForPathname } from "./_document";

describe("langForPathname", () => {
  it("returns fr for /fr and any /fr/* route pattern", () => {
    expect(langForPathname("/fr")).toBe("fr");
    expect(langForPathname("/fr/pokemon/[slug]")).toBe("fr");
    expect(langForPathname("/fr/type-interactions")).toBe("fr");
  });
  it("returns en for root and English route patterns", () => {
    expect(langForPathname("/")).toBe("en");
    expect(langForPathname("/details/[id]")).toBe("en");
    expect(langForPathname("/frobnicate")).toBe("en"); // /fr not followed by / or end
  });
});
