/**
 * Process a string template with given template properties
 * @param value - e.g. `"Hello {{ name | John }}!"`
 * @param templateProperties - properties to replace in the template
 * @returns `"Hello John!"` if `templateProperties` does not have `name` key, otherwise replaces with the value from `templateProperties`
 */
export const template = (value: string, templateProperties: Record<string, string>): string => {
  // eslint-disable-next-line prefer-named-capture-group -- we don't need named groups here
  return value.replace(/\{\{([\s\S]+?)\}\}/g, (templateVar) => {
    const [templateKey, defaultValue] = templateVar
      .replace(/\{\{|\}\}/g, "")
      .trim()
      .split("|")
      .map((s) => s.trim());

    if (!templateKey) return templateVar;

    const replacementValue = templateProperties[templateKey];

    if (typeof replacementValue === "string") {
      return replacementValue.toString();
    }

    return defaultValue ?? "";
  });
};
