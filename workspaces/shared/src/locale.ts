import { type LocaleOption } from "./types";

export const getUserLocale = (locale: LocaleOption = "disabled"): string | undefined => {
  if (locale === "disabled") return undefined;
  if (locale === "automatic") {
    const browserLanguage = navigator.languages.at(0) ?? navigator.language;
    return browserLanguage;
  }
  return locale;
};
