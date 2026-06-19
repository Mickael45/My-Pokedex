import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./App.module.css";
import { LOW_RESOLUTION } from "../constants/Resolution";
import { LIGHT } from "../constants/Theme";
import ErrorContext from "../context/ErrorContext";
import LoadingContext from "../context/LoadingContext";
import PokemonContext from "../context/PokemonContext";
import ResolutionContext from "../context/ResolutionContext";
import ThemeContext from "../context/ThemeContext";
import usePokemons from "../hooks/usePokemons";
import NavigationBar from "../ui/components/NavigationBar/NavigationBar";
import Footer from "../ui/components/Footer/Footer";
import ConsentContext from "../context/ConsentContext";
import useConsent from "../hooks/useConsent";
import ConsentScripts from "../ui/components/ConsentScripts/ConsentScripts";
import CookieConsentBanner from "../ui/components/CookieConsentBanner/CookieConsentBanner";
import { updateConsent } from "../utils/consentMode";
import { GRANTED, DENIED } from "../constants/Consent";

const App = ({ Component, pageProps }: AppProps) => {
  const [filteredPokemons, pokemons, setPokemons] = usePokemons();
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState<RESOLUTION>(LOW_RESOLUTION);
  const [theme, setTheme] = useState<THEME>(LIGHT);
  const [error, setError] = useState<ErrorType | null>(null);
  const { consent, setConsent, hydrated } = useConsent();
  // Detail pages render their own footer inside the type-coloured content area,
  // so the standalone global footer is suppressed there to avoid two footers.
  const isDetailPage = useRouter().pathname === "/details/[id]";

  // Mirror the banner decision into Consent Mode v2 (covers both a fresh click
  // and a granted/denied value restored from localStorage on load).
  useEffect(() => {
    if (consent === GRANTED) updateConsent(true);
    else if (consent === DENIED) updateConsent(false);
  }, [consent]);

  return (
    <ConsentContext.Provider value={{ consent, setConsent, hydrated }}>
      <ConsentScripts />
      <div data-resolution={resolution} className={styles.container} data-theme={theme}>
        <ResolutionContext.Provider value={{ resolution, setResolution }}>
          <ThemeContext.Provider value={{ theme, setTheme }}>
            <ErrorContext.Provider value={{ error, setError }}>
              <LoadingContext.Provider value={{ loading, setLoading }}>
                <PokemonContext.Provider value={{ filteredPokemons, pokemons, setPokemons }}>
                  <>
                    <NavigationBar />
                    <main>
                      <Component {...pageProps} />
                    </main>
                    {!isDetailPage && <Footer />}
                    <CookieConsentBanner />
                  </>
                </PokemonContext.Provider>
              </LoadingContext.Provider>
            </ErrorContext.Provider>
          </ThemeContext.Provider>
        </ResolutionContext.Provider>
      </div>
    </ConsentContext.Provider>
  );
};

export default App;
