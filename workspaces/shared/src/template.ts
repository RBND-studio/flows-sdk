/**
 * Process a string template with given template properties
 * @param value - e.g. `"Hello {{ name | John }}!"`
 * @param templateProperties - properties to replace in the template
 * @returns `"Hello John!"` if `templateProperties` does not have `name` key, otherwise replaces with the value from `templateProperties`
 */
export const template = (value: string, templateProperties: Record<string, unknown>): string => {
  let result = "";
  let cursor = 0;

  while (cursor < value.length) {
    const start = value.indexOf("{{", cursor);
    if (start === -1) {
      result += value.slice(cursor);
      break;
    }

    result += value.slice(cursor, start);

    const end = value.indexOf("}}", start + 2);
    if (end === -1) {
      result += value.slice(start);
      break;
    }

    const rawInside = value.slice(start + 2, end);
    const inside = rawInside.trim();

    const pipeIndex = inside.indexOf("|");
    const templateKey = (pipeIndex === -1 ? inside : inside.slice(0, pipeIndex)).trim();
    const defaultValue = pipeIndex === -1 ? undefined : inside.slice(pipeIndex + 1).trim();

    const templateVar = value.slice(start, end + 2);
    if (!templateKey) {
      result += templateVar;
      cursor = end + 2;
      continue;
    }

    const replacementValue = templateProperties[templateKey];
    if (
      typeof replacementValue === "string" ||
      typeof replacementValue === "number" ||
      typeof replacementValue === "boolean"
    ) {
      result += replacementValue.toString();
      cursor = end + 2;
      continue;
    }

    result += defaultValue ?? "";
    cursor = end + 2;
  }

  return result;
};
