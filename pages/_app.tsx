import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useState } from "react";
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
import { GoogleAnalytics } from "@next/third-parties/google";

const App = ({ Component, pageProps }: AppProps) => {
  const [filteredPokemons, pokemons, setPokemons] = usePokemons();
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState<RESOLUTION>(LOW_RESOLUTION);
  const [theme, setTheme] = useState<THEME>(LIGHT);
  const [error, setError] = useState<ErrorType | null>(null);

  return (
    <>
      <GoogleAnalytics gaId="G-6FS0YBDE8T" />
      <div data-resolution={resolution} className={styles.container} data-theme={theme}>
        <ResolutionContext.Provider value={{ resolution, setResolution }}>
          <ThemeContext.Provider value={{ theme, setTheme }}>
            <ErrorContext.Provider value={{ error, setError }}>
              <LoadingContext.Provider value={{ loading, setLoading }}>
                <PokemonContext.Provider value={{ filteredPokemons, pokemons, setPokemons }}>
                  <>
                    <NavigationBar />
                    <Component {...pageProps} />
                  </>
                </PokemonContext.Provider>
              </LoadingContext.Provider>
            </ErrorContext.Provider>
          </ThemeContext.Provider>
        </ResolutionContext.Provider>
      </div>
    </>
  );
};

export default App;
