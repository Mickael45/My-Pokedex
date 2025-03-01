import { JSX, useEffect } from "react";
import { draw } from "./lib";

interface Props {
  axisDataList: {
    value: number;
    label: string;
  }[];
  color: string;
  title: string;
}

const containerIDSuffix = "radarContainer";

const Radar = ({ axisDataList, color, title }: Props): JSX.Element => {
  const containerID = `${title.replaceAll(" ", "")}-${containerIDSuffix}`;

  const drawRadar = () => {
    if (axisDataList && axisDataList.length > 0) {
      draw(`#${containerID}`, axisDataList, color);
    }
  };

  useEffect(drawRadar, [axisDataList]);

  return (
    <div>
      <h3>{title}</h3>
      <div id={containerID} />
    </div>
  );
};

export default Radar;
