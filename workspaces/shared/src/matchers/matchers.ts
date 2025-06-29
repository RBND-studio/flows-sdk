import {
  $contains,
  $endsWith,
  $eq,
  $ne,
  $notContains,
  $notEndsWith,
  $notStartsWith,
  $regex,
  $startsWith,
} from "../primitive-matchers";

export const pathnameMatch = ({
  operator,
  pathname,
  value,
}: {
  operator?: string;
  value?: string[];
  pathname?: string;
}): boolean => {
  if (operator === "eq") return $eq(pathname, value);
  if (operator === "ne") return $ne(pathname, value);
  if (operator === "contains") return $contains(pathname, value);
  if (operator === "notContains") return $notContains(pathname, value);
  if (operator === "startsWith") return $startsWith(pathname, value);
  if (operator === "endsWith") return $endsWith(pathname, value);
  if (operator === "notStartsWith") return $notStartsWith(pathname, value);
  if (operator === "notEndsWith") return $notEndsWith(pathname, value);
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
