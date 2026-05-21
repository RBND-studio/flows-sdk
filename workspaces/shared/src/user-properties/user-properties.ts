import type { UserProperties } from "../types";

export const isUserPropertiesEqual = (
  a: UserProperties | undefined,
  b: UserProperties | undefined,
): boolean => {
  if (a === b) return true;

  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    const valueA = a[key]?.toString();
    const valueB = b[key]?.toString();

    if (valueA !== valueB) {
      return false;
    }
  }

  return true;
};
