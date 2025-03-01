import { useContext } from "react";
import { LIGHT, DARK } from "../../../constants/Theme";
import ThemeProvider from "../../../context/ThemeContext";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";

const ThemeToggleSwitch = () => {
  const { theme, setTheme } = useContext(ThemeProvider);

  const getOppositeTheme = () => (theme === LIGHT ? DARK : LIGHT);

  const handleClick = () => setTheme(getOppositeTheme());

  return <ToggleSwitch onLabel={LIGHT} offLabel={DARK} checked={theme === DARK} handleClick={handleClick} />;
};

export default ThemeToggleSwitch;
