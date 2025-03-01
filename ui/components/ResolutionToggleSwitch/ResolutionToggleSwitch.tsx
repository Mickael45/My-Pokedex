import { useContext } from "react";
import { HIGH_RESOLUTION, LOW_RESOLUTION } from "../../../constants/Resolution";
import ResolutionContext from "../../../context/ResolutionContext";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";

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
    />
  );
};

export default ResolutionToggleSwitch;
