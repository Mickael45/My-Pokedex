import { createContext } from "react";

// The counterpart hrefs for the current page in each locale. Pages that know
// their language counterpart (detail / type-combo pages, where the id↔slug or
// type-slug mapping is only available at build time) populate this via
// `getStaticProps` → `pageProps.switchTarget`; the language switcher reads it.
// `null` means "no page-provided counterpart" and the switcher falls back to a
// deterministic computation from the current pathname.
export type SwitchTarget = { en: string; fr: string };

const SwitchTargetContext = createContext<SwitchTarget | null>(null);

export default SwitchTargetContext;
