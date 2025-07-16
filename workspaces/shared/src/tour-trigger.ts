import { log } from "./log";
import { elementContains, pathnameMatch } from "./matchers";
import { type TourTrigger, type TourTriggerType } from "./types";

interface Context {
  event?: Event;
  pathname: string;
}

const requiresEventTypes: TourTriggerType[] = ["click"];

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

  if (!context.event) {
    const needsEvent = tourTrigger.$and.some((exp) => requiresEventTypes.includes(exp.type));
    if (needsEvent) return false;
  }

  return tourTrigger.$and.every((exp): boolean => {
    const type: TourTriggerType | undefined = exp.type;
    if (type === "navigation") {
      // The navigation type needs operator to match the value
      if (!exp.operator) return false;
      const value = exp.values;

      return pathnameMatch({
        operator: exp.operator,
        pathname: context.pathname,
        value,
      });
    }
    if (type === "dom-element") {
      const value = exp.value;
      // The dom-element type needs a value to match the selector
      if (typeof value !== "string") return false;
      if (!value) return true;

      return Boolean(document.querySelector(value));
    }
    if (type === "not-dom-element") {
      const value = exp.value;
      // The not-dom-element type needs a value to ensure no matching selector exists
      if (typeof value !== "string") return false;
      if (!value) return true;

      return !document.querySelector(value);
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we may add more types in the future
    if (type === "click") {
      // The click type needs an event to match the event target
      if (!context.event || !(context.event instanceof MouseEvent)) return false;
      const value = exp.value;
      // The click type needs a value to match the selector
      if (typeof value !== "string") return false;
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
