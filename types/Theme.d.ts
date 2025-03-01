import { LIGHT, DARK } from "../constants/Theme";

declare global {
  export type THEME = typeof LIGHT | typeof DARK;
}
