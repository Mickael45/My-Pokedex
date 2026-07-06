import { useRouter } from "next/router";
import { Locale, FR_PREFIX } from "../constants/Locale";
import { UI_STRINGS, UiStrings } from "../locales/uiStrings";

export const localeFromPathname = (pathname: string): Locale =>
  pathname === FR_PREFIX || pathname.startsWith(`${FR_PREFIX}/`) ? "fr" : "en";

export const useLocale = (): Locale => localeFromPathname(useRouter().pathname);
export const useStrings = (): UiStrings => UI_STRINGS[useLocale()];
