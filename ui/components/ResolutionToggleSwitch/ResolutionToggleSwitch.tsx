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
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z" />
    <path d="M18.5 14l.9 2.6L22 17.5l-2.6.9L18.5 21l-.9-2.6L15 17.5l2.6-.9z" />
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
