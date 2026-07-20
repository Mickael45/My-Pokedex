import type { Alternate } from "../ui/components/Header/Header";

// Build the reciprocal hreflang triple (en / fr / x-default) for an EN/FR page
// pair. x-default points at the English URL, matching the `en` entry. Hrefs are
// root-relative; the Header absolutizes them. Extracted so all eight localized
// pages emit the same shape and order, and so it can be unit-tested in isolation.
export const hreflangAlternates = (enHref: string, frHref: string): Alternate[] => [
  { hrefLang: "en", href: enHref },
  { hrefLang: "fr", href: frHref },
  { hrefLang: "x-default", href: enHref },
];
