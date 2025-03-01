import { TYPES, NAME } from "../constants/FilteringFields";

declare global {
  export type FilterField = typeof TYPES | typeof NAME;
}
