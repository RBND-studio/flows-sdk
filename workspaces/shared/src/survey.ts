import type { SurveyPopoverPosition } from "./types";

const SESSION_STORAGE_KEY = "flows-running-surveys";

export const getSessionStorageRunningSurveys = (): string[] => {
  if (typeof window === "undefined") return [];

  const item = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!item) return [];

  try {
    const parsedValue = JSON.parse(item);
    if (!Array.isArray(parsedValue) || !parsedValue.every((v) => typeof v === "string")) {
      throw new Error();
    }

    return parsedValue;
  } catch {
    return [];
  }
};

export const saveSessionStorageRunningSurveys = (runningSurveyIds: string[]): void => {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(runningSurveyIds));
};

export const SURVEY_POPOVER_DEFAULT_POSITION: SurveyPopoverPosition = "bottom-right";
export const SURVEY_POPOVER_DEFAULT_NEXT_BUTTON_LABEL = "Next";
export const SURVEY_POPOVER_DEFAULT_SUBMIT_BUTTON_LABEL = "Submit";
// These durations must stay in sync with the animation durations in survey-popover.css
export const SURVEY_POPOVER_TRANSITION_DURATION = 240;
export const SURVEY_POPOVER_CLOSE_ANIMATION_DURATION = 160;
export const SURVEY_POPOVER_AUTO_PROCEED_DURATION = 320;
// The timeout should sync with the animation duration in survey-popover.css
export const SURVEY_POPOVER_AUTO_CLOSE_TIMEOUT = 3000;
export const SURVEY_EMOJIS = ["😞", "😐", "😊", "😀", "😍"];
export const SURVEY_POPOVER_DEFAULT_OTHER_LABEL = "Other";
export const SURVEY_POPOVER_DEFAULT_FREEFORM_PLACEHOLDER = "Start typing...";
