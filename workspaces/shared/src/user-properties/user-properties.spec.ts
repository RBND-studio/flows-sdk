import { isUserPropertiesEqual } from "./user-properties";

it("should be equal for undefined values", () => {
  expect(isUserPropertiesEqual(undefined, undefined)).toBe(true);
});
it("should not be equal when one is undefined", () => {
  expect(isUserPropertiesEqual(undefined, {})).toBe(false);
  expect(isUserPropertiesEqual({}, undefined)).toBe(false);
});
it("should be equal for empty objects", () => {
  expect(isUserPropertiesEqual({}, {})).toBe(true);
});
it("should be equal with date values", () => {
  expect(
    isUserPropertiesEqual({ date: new Date("2024-01-01") }, { date: new Date("2024-01-01") }),
  ).toBe(true);
});
it("should be equal with number values", () => {
  expect(isUserPropertiesEqual({ num: 1 }, { num: 1 })).toBe(true);
});
it("should be equal with NaN values", () => {
  expect(isUserPropertiesEqual({ num: NaN }, { num: NaN })).toBe(true);
});
it("should be equal with string values", () => {
  expect(isUserPropertiesEqual({ str: "test" }, { str: "test" })).toBe(true);
});
it("should be equal with boolean values", () => {
  expect(isUserPropertiesEqual({ bool: true }, { bool: true })).toBe(true);
});
it("should distinguish null, undefined, and omitted keys", () => {
  expect(isUserPropertiesEqual({ a: null }, { a: undefined })).toBe(false);
  expect(isUserPropertiesEqual({ a: undefined }, {})).toBe(false);
});
it("should not be equal with different values", () => {
  expect(isUserPropertiesEqual({ str: "test" }, { str: "different" })).toBe(false);
});
it("should be equal with mixed object key order", () => {
  expect(isUserPropertiesEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
});
