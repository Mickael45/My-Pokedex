import type { D3SVGElement } from './types'

export default function createRadialOpacityGradient(svg: D3SVGElement, color: string): void {
  const radialGradient = svg
    .select('defs')
    .append('radialGradient')
    .attr('id', 'opgradient')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('cy', 100)
    .attr('cx', 100)
    .attr('r', 100)

  radialGradient.append('stop').attr('offset', '25%').attr('stop-color', color).attr('stop-opacity', 0)
  radialGradient.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 1)
}
