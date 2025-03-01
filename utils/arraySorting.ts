import { compareStrings } from "./stringManipulation";

export const sortByNumberFieldAsc = (array: any, field: string) => {
  const predicate = (a: any, b: any) => a[field] - b[field];

  return [...array.sort(predicate)];
};

export const sortByNumberFieldDesc = (array: any, field: string) => {
  const predicate = (a: any, b: any) => b[field] - a[field];

  return [...array.sort(predicate)];
};

export const sortByStringFieldAsc = (array: any, field: string) => [
  ...array.sort((a: any, b: any) => compareStrings(a[field], b[field])),
];

export const sortByStringFieldDesc = (array: any, field: string) => [
  ...array.sort((a: any, b: any) => compareStrings(b[field], a[field])),
];
