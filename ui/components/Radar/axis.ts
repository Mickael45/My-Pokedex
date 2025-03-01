import { RADAR_WIDTH, RADAR_HEIGHT, RADIANS } from "./constants";
import { calculateAxisXPointPosition, calculateAxisYPointPosition } from "./pointPositionCalculator";
import createRadialOpacityGradient from "./colorGradient";

import type { D3SVGElement, D3AxisElement, AxisData } from "./types";

const createAxisValues = (axis: D3AxisElement, axesValue: number[], color: string) => {
  const axesNumber = axesValue.length;

  axis
    .append("text")
    .data(axesValue)
    .text((d: number) => d)
    .attr("id", "value")
    .style("font-size", "13px")
    .style("font-weight", "bolder")
    .style("fill", color)
    .attr("text-anchor", "middle")
    .attr("dy", 15)
    .attr("x", (_: any, textIndex: number) => calculateAxisXPointPosition(textIndex, axesNumber))
    .attr("y", (_: any, i: number) => calculateAxisYPointPosition(i, axesNumber));
};

const createAxisLabels = (axis: D3AxisElement, axesLabel: string[], axesNumber: number) => {
  axis
    .append("text")
    .attr("id", "label")
    .data(axesLabel)
    .text((d: string) => d)
    .style("font-size", "11px")
    .style("fill", "black")
    .attr("text-anchor", "middle")
    .attr("y", (_: any, i: number) => calculateAxisYPointPosition(i, axesNumber))
    .attr("x", (_: any, i: number) => calculateAxisXPointPosition(i, axesNumber));
};

const appendAxesToSvg = (svg: D3SVGElement, axesValueList: number[]) =>
  svg.selectAll(".axis").data(axesValueList).enter().append("g");

const appendLineToAxes = (axes: D3AxisElement, axesNumber: number) =>
  axes
    .append("line")
    .attr("x1", RADAR_WIDTH / 2)
    .attr("y1", RADAR_HEIGHT / 2)
    .attr("x2", (_: any, i: number) => (RADAR_WIDTH / 2) * (1 - Math.sin((i * RADIANS) / axesNumber)))
    .attr("y2", (_: any, i: number) => (RADAR_HEIGHT / 2) * (1 - Math.cos((i * RADIANS) / axesNumber)))
    .attr("stroke", "url(#opgradient)")
    .style("stroke-width", "1px");

export default function createAxes(svg: D3SVGElement, axesDataList: AxisData[], color: string): void {
  const axesNumber = axesDataList.length;
  const axesLabelList = axesDataList.map(({ label }) => label);
  const axesValueList = axesDataList.map(({ value }) => value);
  const axes = appendAxesToSvg(svg, axesValueList);

  createRadialOpacityGradient(svg, "black");
  appendLineToAxes(axes, axesNumber);
  createAxisLabels(axes, axesLabelList, axesNumber);
  createAxisValues(axes, axesValueList, color);
}
