import { describe, it, expect } from "vitest";
import { alternateLinkTags } from "./Header";
import { SITE_ORIGIN } from "../../../constants/Seo";

describe("alternateLinkTags", () => {
  it("absolutizes root-relative hrefs and preserves hrefLang", () => {
    expect(alternateLinkTags([{ hrefLang: "fr", href: "/fr" }])).toEqual([
      { hrefLang: "fr", href: `${SITE_ORIGIN}/fr` },
    ]);
  });

  it("maps multiple alternates in order", () => {
    expect(
      alternateLinkTags([
        { hrefLang: "en", href: "/" },
        { hrefLang: "fr", href: "/fr" },
        { hrefLang: "x-default", href: "/" },
      ]),
    ).toEqual([
      { hrefLang: "en", href: `${SITE_ORIGIN}/` },
      { hrefLang: "fr", href: `${SITE_ORIGIN}/fr` },
      { hrefLang: "x-default", href: `${SITE_ORIGIN}/` },
    ]);
  });

  it("passes already-absolute hrefs through untouched", () => {
    expect(
      alternateLinkTags([{ hrefLang: "fr", href: "https://example.com/fr" }]),
    ).toEqual([{ hrefLang: "fr", href: "https://example.com/fr" }]);
  });

  it("returns [] for undefined", () => {
    expect(alternateLinkTags(undefined)).toEqual([]);
  });

  it("returns [] for an empty list", () => {
    expect(alternateLinkTags([])).toEqual([]);
  });
});
