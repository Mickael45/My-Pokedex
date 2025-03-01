import { select } from "d3";
import createCurve from "./curve";
import createAxes from "./axis";
import {
  SVG_HEIGHT,
  SVG_WIDTH,
  TRANSLATE_X,
  TRANSLATE_Y,
  FACTOR,
  AXIS_LEVELS,
  RADAR_WIDTH,
  RADAR_HEIGHT,
  RADIANS,
} from "./constants";

import type { D3SVGElement, AxisData } from "./types";

const createSvg = (id: string) =>
  select(id)
    .append("svg")
    .attr("id", `${id}Chart`)
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .append("g")
    .attr("transform", `translate(${TRANSLATE_X}, ${TRANSLATE_Y})`)
    .attr("viewBox", `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`);

const createBorders = (svg: D3SVGElement, axisDataList: AxisData[]) => {
  const radius = FACTOR * Math.min(RADAR_WIDTH / 2, RADAR_HEIGHT / 2);
  const levelFactor = FACTOR * radius * ((4 + 1) / AXIS_LEVELS);
  const axesNumber = axisDataList.length;

  svg
    .selectAll(".levels")
    .data(axisDataList.map((d) => d.value))
    .enter()
    .append("line")
    .style("stroke-width", "1px")
    .style("stroke", "black")
    .attr("x1", (_: number, i: number) => levelFactor * (1 - FACTOR * Math.sin((i * RADIANS) / axesNumber)))
    .attr("y1", (_: number, i: number) => levelFactor * (1 - FACTOR * Math.cos((i * RADIANS) / axesNumber)))
    .attr("x2", (_: number, i: number) => levelFactor * (1 - FACTOR * Math.sin(((i + 1) * RADIANS) / axesNumber)))
    .attr("y2", (_: number, i: number) => levelFactor * (1 - FACTOR * Math.cos(((i + 1) * RADIANS) / axesNumber)));
};

const createDef = (svg: D3SVGElement) => svg.append("defs");

const deleteSvg = (id: string) => document.getElementById(id)?.remove();

export const draw = (id: string, axisDataList: AxisData[], color: string): void => {
  deleteSvg(`${id}Chart`);

  const svg = createSvg(id);

  createDef(svg);
  createBorders(svg, axisDataList);
  createAxes(svg, axisDataList, color);
  createCurve(svg, axisDataList, color);
};
