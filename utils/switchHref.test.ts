import { describe, it, expect } from "vitest";
import { switchHref } from "./switchHref";

describe("switchHref", () => {
  it("maps the EN home to the FR home", () => {
    expect(switchHref("en", "/", null)).toBe("/fr");
  });

  it("maps the FR home to the EN home", () => {
    expect(switchHref("fr", "/fr", null)).toBe("/");
  });

  it("maps the EN type index to the FR type index", () => {
    expect(switchHref("en", "/type-interactions", null)).toBe("/fr/type-interactions");
  });

  it("maps the FR type index to the EN type index", () => {
    expect(switchHref("fr", "/fr/type-interactions", null)).toBe("/type-interactions");
  });

  it("maps the legal pages EN <-> FR", () => {
    expect(switchHref("en", "/about", null)).toBe("/fr/about");
    expect(switchHref("fr", "/fr/about", null)).toBe("/about");
    expect(switchHref("en", "/privacy", null)).toBe("/fr/privacy");
    expect(switchHref("fr", "/fr/contact", null)).toBe("/contact");
    expect(switchHref("en", "/terms", null)).toBe("/fr/terms");
  });

  it("falls back to the other locale home for unknown routes", () => {
    expect(switchHref("en", "/details/[id]", null)).toBe("/fr");
    expect(switchHref("fr", "/fr/pokemon/[slug]", null)).toBe("/");
  });

  it("prefers the page-provided counterpart when present", () => {
    const target = { en: "/details/25", fr: "/fr/pokemon/pikachu" };
    expect(switchHref("en", "/details/[id]", target)).toBe("/fr/pokemon/pikachu");
    expect(switchHref("fr", "/fr/pokemon/[slug]", target)).toBe("/details/25");
  });
});
