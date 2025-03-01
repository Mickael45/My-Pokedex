import { LOW_RESOLUTION, HIGH_RESOLUTION } from "../constants/Resolution";

declare global {
  export type RESOLUTION = typeof LOW_RESOLUTION | typeof HIGH_RESOLUTION;
}
