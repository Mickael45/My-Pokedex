import { Locale } from "../constants/Locale";
import { HOME, TYPE_INTERACTIONS, FR_HOME, FR_TYPE_INTERACTIONS } from "../constants/Routes";
import type { SwitchTarget } from "../context/SwitchTargetContext";

// Resolve the href of the current page in the OTHER locale.
//
// When a page has supplied its counterpart (`context` non-null) we trust it —
// this covers detail / type-combo pages whose id↔slug or type-slug mapping is
// only known at build time. Otherwise we compute the counterpart deterministically
// from the pathname: the two home pages and the two type-index pages map onto
// each other; anything else safely falls back to the other locale's home.
export const switchHref = (
  locale: Locale,
  pathname: string,
  context: SwitchTarget | null
): string => {
  const other: Locale = locale === "fr" ? "en" : "fr";

  if (context) return context[other];

  if (pathname === HOME || pathname === FR_HOME) {
    return other === "fr" ? FR_HOME : HOME;
  }
  if (pathname === TYPE_INTERACTIONS || pathname === FR_TYPE_INTERACTIONS) {
    return other === "fr" ? FR_TYPE_INTERACTIONS : TYPE_INTERACTIONS;
  }

  return other === "fr" ? FR_HOME : HOME;
};
