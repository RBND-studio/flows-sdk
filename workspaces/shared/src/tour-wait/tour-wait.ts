import { template } from "../template";
import type { TourWait, UserProperties } from "../types";

export const processTourWait = (
  tourWait: TourWait | undefined,
  userProperties: UserProperties,
): TourWait | undefined => {
  if (!tourWait) return tourWait;

  return {
    ...tourWait,
    element:
      typeof tourWait.element === "string" ? template(tourWait.element, userProperties) : undefined,
    page: tourWait.page
      ? {
          ...tourWait.page,
          value: tourWait.page.value.map((v) => template(v, userProperties)),
        }
      : undefined,
  };
};
