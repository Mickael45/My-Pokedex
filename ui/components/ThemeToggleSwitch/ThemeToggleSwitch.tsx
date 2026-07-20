import { useContext } from "react";
import { LIGHT, DARK } from "../../../constants/Theme";
import ThemeProvider from "../../../context/ThemeContext";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";

const SunIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
  </svg>
);

const MoonIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 14a8 8 0 1 1-9-9 6.5 6.5 0 0 0 9 9z" />
  </svg>
);

const ThemeToggleSwitch = () => {
  const { theme, setTheme } = useContext(ThemeProvider);

  const getOppositeTheme = () => (theme === LIGHT ? DARK : LIGHT);

  const handleClick = () => setTheme(getOppositeTheme());

  return (
    <ToggleSwitch
      onLabel={LIGHT}
      offLabel={DARK}
      checked={theme === DARK}
      handleClick={handleClick}
      icons={{ on: MoonIcon, off: SunIcon }}
    />
  );
};

export default ThemeToggleSwitch;
