import { CENTER_OPACITY_AREA } from "./constants";
import { calculateCurveXPosition, calculateCurveYPosition } from "./pointPositionCalculator";

import type { D3SVGElement, AxisData } from "./types";

export default function createCurve(svg: D3SVGElement, axisDataList: AxisData[], color: string): void {
  const dataValues: [number[]] = [[]];
  const axesNumber = axisDataList.length;

  svg
    .selectAll(".nodes")
    .data(
      axisDataList.map(({ value }) => value),
      (value: number | unknown, i: number) => {
        const castedValue = value as number;
        if (i === 0) {
          dataValues.pop();
        }
        return dataValues.push([
          calculateCurveXPosition(axesNumber, i, castedValue),
          calculateCurveYPosition(axesNumber, i, castedValue),
        ]);
      }
    )
    .transition()
    .duration(2000);

  dataValues.push(dataValues[0]);

  svg
    .selectAll(".area")
    .data([dataValues])
    .enter()
    .append("polygon")
    .style("stroke-width", "2px")
    .style("stroke", color)
    .attr("points", (d: any) => {
      let str = "";
      for (let pti = 0; pti < d.length; pti++) {
        str += "100, 100 ";
      }
      return str;
    })
    .transition()
    .duration(2000)
    .attr("points", (d: any) => {
      let str = "";
      for (let pti = 0; pti < d.length; pti++) {
        str += `${d[pti][0]},${d[pti][1]} `;
      }
      return str;
    })
    .style("fill", color)
    .style("fill-opacity", CENTER_OPACITY_AREA);
}
