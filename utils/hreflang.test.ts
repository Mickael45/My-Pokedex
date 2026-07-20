import { describe, it, expect } from "vitest";
import { hreflangAlternates } from "./hreflang";

describe("hreflangAlternates", () => {
  it("builds the en / fr / x-default triple in order", () => {
    expect(hreflangAlternates("/pokemon/pikachu", "/fr/pokemon/pikachu")).toEqual([
      { hrefLang: "en", href: "/pokemon/pikachu" },
      { hrefLang: "fr", href: "/fr/pokemon/pikachu" },
      { hrefLang: "x-default", href: "/pokemon/pikachu" },
    ]);
  });

  it("points x-default at the english href", () => {
    const [, , xDefault] = hreflangAlternates("/", "/fr");
    expect(xDefault).toEqual({ hrefLang: "x-default", href: "/" });
  });
});
