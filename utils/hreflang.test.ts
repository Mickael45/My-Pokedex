import { describe, it, expect } from "vitest";
import { hreflangAlternates } from "./hreflang";

describe("hreflangAlternates", () => {
  it("builds the en / fr / x-default triple in order", () => {
    expect(hreflangAlternates("/details/25", "/fr/pokemon/pikachu")).toEqual([
      { hrefLang: "en", href: "/details/25" },
      { hrefLang: "fr", href: "/fr/pokemon/pikachu" },
      { hrefLang: "x-default", href: "/details/25" },
    ]);
  });

  it("points x-default at the english href", () => {
    const [, , xDefault] = hreflangAlternates("/", "/fr");
    expect(xDefault).toEqual({ hrefLang: "x-default", href: "/" });
  });
});
