import type { UserProperties } from "../types";

const getCompareValue = (value: UserProperties[keyof UserProperties]): unknown => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "number" && isNaN(value)) {
    return value.toString();
  }

  return value;
};

export const isUserPropertiesEqual = (
  a: UserProperties | undefined,
  b: UserProperties | undefined,
): boolean => {
  if (a === b) return true;

  if (a === undefined || b === undefined) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    const valueA = getCompareValue(a[key]);
    const valueB = getCompareValue(b[key]);

    if (valueA !== valueB) {
      return false;
    }
  }

  return true;
};
