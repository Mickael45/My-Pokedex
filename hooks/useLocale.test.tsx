import { describe, it, expect, vi } from "vitest";
import { localeFromPathname } from "./useLocale";

describe("localeFromPathname", () => {
  it("returns fr for /fr and any /fr/* route", () => {
    expect(localeFromPathname("/fr")).toBe("fr");
    expect(localeFromPathname("/fr/pokemon/bulbizarre")).toBe("fr");
    expect(localeFromPathname("/fr/type-interactions")).toBe("fr");
  });
  it("returns en for root and English routes", () => {
    expect(localeFromPathname("/")).toBe("en");
    expect(localeFromPathname("/pokemon/[slug]")).toBe("en");
    expect(localeFromPathname("/frobnicate")).toBe("en"); // /fr not followed by / or end
  });
});
