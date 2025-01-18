import { $contains, $notContains, $regex } from "../primitive-matchers";

export const pathnameMatch = ({
  operator,
  pathname,
  value,
}: {
  operator?: string;
  value?: string[];
  pathname?: string;
}): boolean => {
  if (operator === "contains") return $contains(pathname, value);
  if (operator === "notContains") return $notContains(pathname, value);
  if (operator === "regex") return $regex(pathname, value);

  return true;
};

/**
 * Function for checking if an `eventTarget` element is inside any element that matches the `value` selector or is equal.
 */
export const elementContains = ({
  eventTarget,
  value,
}: {
  eventTarget: Element;
  value?: string;
}): boolean => {
  if (!value) return false;
  return Array.from(document.querySelectorAll(value)).some((el) => el.contains(eventTarget));
};
