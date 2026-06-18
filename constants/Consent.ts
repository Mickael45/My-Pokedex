export const GRANTED = "granted";
export const DENIED = "denied";
export const UNSET = "unset";

export const CONSENT_STORAGE_KEY = "cookie-consent";

export type CONSENT = typeof GRANTED | typeof DENIED | typeof UNSET;
