import { ASCENDING_ID, DESCENDING_ID, ASCENDING_NAME, DESCENDING_NAME } from "../constants/SortingTypes";

declare global {
  export type SortingType = typeof ASCENDING_ID | typeof DESCENDING_ID | typeof ASCENDING_NAME | typeof DESCENDING_NAME;
}
