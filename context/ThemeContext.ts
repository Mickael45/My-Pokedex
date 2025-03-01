import { createContext } from "react";
import { LIGHT } from "../constants/Theme";

interface IContextProps {
  theme: THEME;
  setTheme: (theme: THEME) => void;
}

export default createContext<IContextProps>({
  theme: LIGHT,
  setTheme: () => {},
});
