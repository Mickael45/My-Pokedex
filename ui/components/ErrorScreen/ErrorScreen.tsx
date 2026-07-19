import Head from "next/head";
import { useEffect, useState } from "react";
import { PAGE_NOT_FOUND } from "../../../constants/Errors";
import { SITE_NAME } from "../../../constants/Seo";
import { Locale } from "../../../constants/Locale";
import { localeFromPathname } from "../../../hooks/useLocale";
import { UI_STRINGS } from "../../../locales/uiStrings";
import { usePokemonPic } from "../../../hooks/usePokemonPic";
import styles from "./ErrorScreen.module.css";

interface IProps {
  type: ErrorType;
}

export const ErrorScreen = ({ type }: IProps) => {
  const gif = usePokemonPic("/images/surprised-pikachu.png", "/images/surprised-pikachu-hd.png");

  // The single static 404/500 page is prerendered once (in English) and served
  // for misses under BOTH /pokemon/* and /fr/pokemon/*, so its route-based
  // useLocale() can't tell the visitor's language. Read it from the real URL —
  // but only after mount, so the first client render still matches the English
  // prerender (no hydration mismatch); French visitors see a one-frame flip.
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    const detected = localeFromPathname(window.location.pathname);
    setLocale(detected);
    // Keep <html lang> in step with the message for correct AT pronunciation
    // (the prerendered 404.html hard-codes lang="en").
    document.documentElement.lang = detected;
  }, []);

  const strings = UI_STRINGS[locale];
  const message = type === PAGE_NOT_FOUND ? strings.errorNotFound : strings.errorSomethingWrong;

  return (
    <>
      {/* Error pages ship no <Header>, so give them their own <title> (axe
          document-title) and a single top-level heading for page structure. */}
      <Head>
        <title>{`${message} — ${SITE_NAME}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div id="error-screen" className={styles.container}>
        <div>
          <img
            src={gif}
            alt={strings.errorImageAlt}
            height={300}
            width={300}
            style={{
              maxWidth: "100%",
              height: "auto"
            }} />
          <h1 style={{ margin: 0, font: "inherit" }}>{message}</h1>
        </div>
      </div>
    </>
  );
};
