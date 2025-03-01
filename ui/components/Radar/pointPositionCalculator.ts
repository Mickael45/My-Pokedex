import { FACTOR, RADIANS, RADAR_HEIGHT, RADAR_WIDTH, MAX_AXIS_VALUE, LEGEND_FACTOR } from './constants'

export const calculateAxisYPointPosition = (i: number, total: number): number =>
  (RADAR_HEIGHT / 2) * (1 - Math.cos((i * RADIANS) / total)) - 25 * Math.cos((i * RADIANS) / total)

export const calculateAxisXPointPosition = (i: number, total: number): number =>
  (RADAR_WIDTH / 2) * (1 - LEGEND_FACTOR * Math.sin((i * RADIANS) / total)) - 60 * Math.sin((i * RADIANS) / total)

export const calculateCurveYPosition = (total: number, i: number, value: number): number =>
  (RADAR_HEIGHT / 2) * (1 - (value / (MAX_AXIS_VALUE + MAX_AXIS_VALUE / 50)) * FACTOR * Math.cos((i * RADIANS) / total) || 1)

export const calculateCurveXPosition = (total: number, i: number, value: number): number =>
  (RADAR_WIDTH / 2) * (1 - (value / (MAX_AXIS_VALUE + MAX_AXIS_VALUE / 50)) * FACTOR * Math.sin((i * RADIANS) / total) || 1)
