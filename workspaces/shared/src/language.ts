import { type LanguageOption } from "./types";

export const getUserLanguage = (language?: LanguageOption): string | undefined => {
  if (!language || language === "disabled") return undefined;
  if (language === "automatic") {
    const browserLanguage = navigator.languages.at(0) ?? navigator.language;
    return browserLanguage;
  }
  return language;
};
