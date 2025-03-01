import { createContext } from "react";
import { LOW_RESOLUTION } from "../constants/Resolution";

interface IContextProps {
  resolution: RESOLUTION;
  setResolution: (resolution: RESOLUTION) => void;
}

export default createContext<IContextProps>({
  resolution: LOW_RESOLUTION,
  setResolution: () => {},
});
