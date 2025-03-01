import { TYPES, ID, NAME, EMPTY } from "../constants/QueryTypes";

declare global {
  export type QueryType = typeof TYPES | typeof ID | typeof NAME | typeof EMPTY;
  export type QueryObj = { type: QueryType; value: string };
}
