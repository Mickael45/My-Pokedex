import { useContext } from "react";
import { HIGH_RESOLUTION, LOW_RESOLUTION } from "../../../constants/Resolution";
import ResolutionContext from "../../../context/ResolutionContext";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";

const PixelIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="7" height="7" />
    <rect x="13" y="4" width="7" height="7" />
    <rect x="4" y="13" width="7" height="7" />
    <rect x="13" y="13" width="7" height="7" />
  </svg>
);

const HdIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <path d="M8 14c2-3.5 6-3.5 8 0" />
  </svg>
);

const ResolutionToggleSwitch = () => {
  const { resolution, setResolution } = useContext(ResolutionContext);

  const getOppositeResolution = () => (resolution === LOW_RESOLUTION ? HIGH_RESOLUTION : LOW_RESOLUTION);

  const handleClick = () => setResolution(getOppositeResolution());

  return (
    <ToggleSwitch
      onLabel={LOW_RESOLUTION}
      offLabel={HIGH_RESOLUTION}
      checked={resolution === HIGH_RESOLUTION}
      handleClick={handleClick}
      icons={{ on: HdIcon, off: PixelIcon }}
    />
  );
};

export default ResolutionToggleSwitch;
