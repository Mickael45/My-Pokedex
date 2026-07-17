import { describe, it, expect } from "vitest";
// langForPathname is defined in pages/_document.tsx. This test MUST NOT live under
// pages/ — Next.js would treat a pages/*.test.tsx file as a route and the static
// export (`output: 'export'`) fails prerendering the bogus /_document.test page.
import { langForPathname } from "../pages/_document";

describe("langForPathname", () => {
  it("returns fr for /fr and any /fr/* route pattern", () => {
    expect(langForPathname("/fr")).toBe("fr");
    expect(langForPathname("/fr/pokemon/[slug]")).toBe("fr");
    expect(langForPathname("/fr/type-interactions")).toBe("fr");
  });
  it("returns en for root and English route patterns", () => {
    expect(langForPathname("/")).toBe("en");
    expect(langForPathname("/pokemon/[slug]")).toBe("en");
    expect(langForPathname("/frobnicate")).toBe("en"); // /fr not followed by / or end
  });
});
