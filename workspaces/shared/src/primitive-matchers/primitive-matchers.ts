export type PrimitiveValue = string | number | boolean | null;
/**
 * Data types that can be compared.
 *
 * `Date` can also be supplied in ISO 8601 format to support sending dates in JSON.
 */
export type CompareValue = number | Date | string;

const parseDate = (date: unknown): Date | null => {
  if (date instanceof Date) return date;
  if (typeof date !== "string") return null;
  const parsed = Date.parse(date);
  if (isNaN(parsed)) return null;
  if (new Date(parsed).toISOString() !== date) return null;
  return new Date(parsed);
};

export const $regex = (value?: unknown, regex?: string | string[]): boolean => {
  if (!regex) return true;
  if (Array.isArray(regex)) return regex.some((r) => $regex(value, r));
  if (typeof value !== "string") return false;
  return new RegExp(regex).test(value);
};
export const $eq = (value?: unknown, expected?: PrimitiveValue | PrimitiveValue[]): boolean => {
  if (expected === undefined) return true;
  if (Array.isArray(expected)) return expected.some((v) => $eq(value, v));
  return value === expected;
};
export const $ne = (value?: unknown, expected?: PrimitiveValue | PrimitiveValue[]): boolean => {
  if (expected === undefined) return true;
  if (Array.isArray(expected)) return expected.every((v) => $ne(value, v));
  return value !== expected;
};
export const $gt = (value?: unknown, expected?: CompareValue): boolean => {
  if (!expected) return true;
  if (typeof value === "number" && typeof expected === "number") return value > expected;
  const expectedDate = parseDate(expected);
  const valueDate = parseDate(value);
  if (expectedDate && valueDate) return valueDate > expectedDate;
  if (typeof value === "string" && typeof expected === "string") return value > expected;
  return false;
};
export const $gte = (value?: unknown, expected?: CompareValue): boolean => {
  if (!expected) return true;
  if (typeof value === "number" && typeof expected === "number") return value >= expected;
  const expectedDate = parseDate(expected);
  const valueDate = parseDate(value);
  if (expectedDate && valueDate) return valueDate >= expectedDate;
  if (typeof value === "string" && typeof expected === "string") return value >= expected;
  return false;
};
export const $lt = (value?: unknown, expected?: CompareValue): boolean => {
  if (!expected) return true;
  if (typeof value === "number" && typeof expected === "number") return value < expected;
  const expectedDate = parseDate(expected);
  const valueDate = parseDate(value);
  if (expectedDate && valueDate) return valueDate < expectedDate;
  if (typeof value === "string" && typeof expected === "string") return value < expected;
  return false;
};
export const $lte = (value?: unknown, expected?: CompareValue): boolean => {
  if (!expected) return true;
  if (typeof value === "number" && typeof expected === "number") return value <= expected;
  const expectedDate = parseDate(expected);
  const valueDate = parseDate(value);
  if (expectedDate && valueDate) return valueDate <= expectedDate;
  if (typeof value === "string" && typeof expected === "string") return value <= expected;
  return false;
};
export const $contains = (value?: unknown, expected?: string | string[]): boolean => {
  if (!expected) return true;
  if (Array.isArray(expected)) return expected.some((v) => $contains(value, v));
  if (typeof value !== "string") return false;
  return value.includes(expected);
};
export const $notContains = (value?: unknown, expected?: string | string[]): boolean => {
  if (!expected) return true;
  if (Array.isArray(expected)) return expected.every((v) => $notContains(value, v));
  if (typeof value !== "string") return false;
  return !value.includes(expected);
};
