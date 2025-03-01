import { useContext } from "react";
import { LOW_RESOLUTION } from "../constants/Resolution";
import ResolutionContext from "../context/ResolutionContext";

export const usePokemonPic = (pixelImageUrl: string, hdImageUrl: string) => {
  const { resolution } = useContext(ResolutionContext);

  return resolution === LOW_RESOLUTION ? pixelImageUrl : hdImageUrl;
};
