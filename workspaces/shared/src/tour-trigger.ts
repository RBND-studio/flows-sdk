import { log } from "./log";
import { elementContains, elementExists, elementNotExists, pathnameMatch } from "./matchers";
import { type TourTrigger, type TourTriggerType } from "./types";

interface Context {
  event?: Event;
  pathname: string;
}

export const tourTriggerMatch = (
  tourTrigger: TourTrigger | undefined,
  context: Context,
): boolean => {
  // Undefined tour trigger means the tour should start
  if (!tourTrigger) return true;

  // If the tour trigger doesn't match what current SDK supports, we never match it
  if (!tourTrigger.$and) {
    log.error(
      "Aborting tour start due to an unsupported tour trigger format. Try updating the SDK or changing the tour trigger configuration.",
    );
    return false;
  }

  return tourTrigger.$and.every((exp): boolean => {
    const type: TourTriggerType | undefined = exp.type;
    if (type === "navigation") {
      // If the user doesn't fill in the operator, we treat it as a match
      if (!exp.operator) return true;
      const value = exp.values;
      // If the array is only list of empty strings, we treat it as a match
      if (value?.every((v) => !v)) return true;

      return pathnameMatch({
        operator: exp.operator,
        pathname: context.pathname,
        value,
      });
    }
    if (type === "dom-element") {
      return elementExists(exp.value);
    }
    if (type === "not-dom-element") {
      return elementNotExists(exp.value);
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we may add more types in the future
    if (type === "click") {
      const value = exp.value;
      if (typeof value !== "string") return false;
      // if the value is empty, we treat it as a match, even without an event to start the tour immediately
      if (!value) return true;
      // The click type needs an event to match the event target
      if (!context.event || !(context.event instanceof MouseEvent)) return false;
      // The click type needs a value to match the selector
      const eventTarget = context.event.target;
      if (!eventTarget || !(eventTarget instanceof Element)) return false;
      return elementContains({ eventTarget, value });
    }

    log.error(
      `Aborting tour start due to an unrecognized tour trigger type: ${type}. Try updating the SDK or changing the tour trigger configuration.`,
    );
    // When the expression isn't recognized, we treat it as non-matching and abort the tour start
    return false;
  });
};
