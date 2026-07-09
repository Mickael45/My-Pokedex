// Google Consent Mode v2. The deny-by-default state is emitted from _document
// before any tag loads; this updates it after the user decides via the banner.
type ConsentValue = "granted" | "denied";

interface Gtag {
  (...args: unknown[]): void;
}

const getGtag = (): Gtag | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { gtag?: Gtag };
  return typeof w.gtag === "function" ? w.gtag : null;
};

export const updateConsent = (granted: boolean): void => {
  const gtag = getGtag();
  if (!gtag) return;
  const value: ConsentValue = granted ? "granted" : "denied";
  gtag("consent", "update", {
    analytics_storage: value,
  });
};
