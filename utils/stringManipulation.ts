const addNZerosBeforeString = (str: string, n: number) => {
  const zeros = [];

  for (let i = 0; i < n; i++) {
    zeros.push("0");
  }

  return `${zeros.join("")}${str}`;
};

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const compareStrings = (strA: string, strB: string) => {
  if (strA < strB) {
    return -1;
  }
  return strA > strB ? 1 : 0;
};

export const extractThreeFirstLetters = (str: string) => str.substring(0, 3);

export const capitalizeString = (str: string) => str.toUpperCase();

export const formatNumberToMatchLength = (number: number, length: number = 3) => {
  const stringedNumber = number.toString();

  if (stringedNumber.length === length) {
    return stringedNumber;
  }

  const numbersOfZerosToAdd = length - stringedNumber.length;

  return `${addNZerosBeforeString(stringedNumber, numbersOfZerosToAdd)}`;
};
