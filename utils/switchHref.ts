import { Locale } from "../constants/Locale";
import {
  HOME,
  TYPE_INTERACTIONS,
  ABOUT,
  PRIVACY,
  CONTACT,
  TERMS,
  FR_HOME,
  FR_TYPE_INTERACTIONS,
  FR_ABOUT,
  FR_PRIVACY,
  FR_CONTACT,
  FR_TERMS,
} from "../constants/Routes";
import type { SwitchTarget } from "../context/SwitchTargetContext";

// Static routes whose EN↔FR counterpart is fixed and known ahead of time: the two
// home pages, the two type-index pages, and the four legal/trust pages. Detail and
// type-combo pages instead supply their counterpart at build time via context.
const STATIC_PAIRS: ReadonlyArray<readonly [en: string, fr: string]> = [
  [HOME, FR_HOME],
  [TYPE_INTERACTIONS, FR_TYPE_INTERACTIONS],
  [ABOUT, FR_ABOUT],
  [PRIVACY, FR_PRIVACY],
  [CONTACT, FR_CONTACT],
  [TERMS, FR_TERMS],
];

// Resolve the href of the current page in the OTHER locale.
//
// When a page has supplied its counterpart (`context` non-null) we trust it —
// this covers detail / type-combo pages whose id↔slug or type-slug mapping is
// only known at build time. Otherwise we compute the counterpart deterministically
// from a fixed table of static pairs; anything not in it safely falls back to the
// other locale's home.
export const switchHref = (
  locale: Locale,
  pathname: string,
  context: SwitchTarget | null
): string => {
  const other: Locale = locale === "fr" ? "en" : "fr";

  if (context) return context[other];

  const pair = STATIC_PAIRS.find(([en, fr]) => pathname === en || pathname === fr);
  if (pair) return other === "fr" ? pair[1] : pair[0];

  return other === "fr" ? FR_HOME : HOME;
};
