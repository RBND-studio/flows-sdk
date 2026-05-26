import type { TourWait, UserProperties } from "../types";
import { processTourWait } from "./tour-wait";

const tourWait: TourWait = {
  interaction: "navigation",
  element: ".btn-{{name}}",
  page: {
    value: ["{{name1}}", "{{name2}}"],
    operator: "or",
  },
  ms: 100,
};
const userProperties: UserProperties = {
  name: "John",
  name1: "Page1",
  name2: "Page2",
};

it("should return undefined if tourWait is undefined", () => {
  expect(processTourWait(undefined, {})).toBeUndefined();
});
it("should replace with empty string without user properties", () => {
  expect(processTourWait(tourWait, {})).toEqual({
    interaction: "navigation",
    element: ".btn-",
    page: {
      value: ["", ""],
      operator: "or",
    },
    ms: 100,
  });
});
it("should process templates in tourWait", () => {
  expect(processTourWait(tourWait, userProperties)).toEqual({
    interaction: "navigation",
    element: ".btn-John",
    page: {
      value: ["Page1", "Page2"],
      operator: "or",
    },
    ms: 100,
  });
});
