export const kgToPoundsString = (weight: number) => `${(weight * 2.205).toFixed(1)} lbs`;

export const cmToFeetString = (height: number) => {
  const realFeet = (height * 0.3937) / 12;
  const feet = Math.floor(realFeet);
  const inches = Math.round((realFeet - feet) * 12);

  return `${feet}'${inches}"`;
};

export const convertCmtoMeterString = (height: number) => `${height / 100} m`;

export const joinValueWithUnit = (value: number, unit: string) => `${value.toFixed(1)} ${unit}`;
