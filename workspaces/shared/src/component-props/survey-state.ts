import { debounce } from "es-toolkit";

type SurveyState = {
  [questionId: string]: {
    textResponse?: string;
    optionIds?: string[];
    otherSelected?: boolean;
    clickedLink?: boolean;
  };
};

const surveyStates = new Map<string, SurveyState>();

const getSessionStorageKey = (surveyId: string): string => `flows-survey-state-${surveyId}`;
const persistSurveyState = (surveyId: string): void => {
  const surveyState = surveyStates.get(surveyId);
  if (!surveyState) return;
  sessionStorage.setItem(getSessionStorageKey(surveyId), JSON.stringify(surveyState));
};
const debouncedPersistSurveyState = debounce(persistSurveyState, 1000);

export const getSurveyState = (surveyId: string): SurveyState | undefined => {
  const surveyState = surveyStates.get(surveyId);
  if (surveyState) return surveyState;
  const persistedState = sessionStorage.getItem(getSessionStorageKey(surveyId));
  if (persistedState) {
    const parsedState = JSON.parse(persistedState) as SurveyState;
    surveyStates.set(surveyId, parsedState);
    return parsedState;
  }
};

export const clearSurveyState = (surveyId: string): void => {
  const surveyState = surveyStates.get(surveyId);
  if (surveyState) {
    surveyStates.delete(surveyId);
    sessionStorage.removeItem(getSessionStorageKey(surveyId));
  }
};

export const setQuestionValue = ({
  questionId,
  surveyId,
  value,
}: {
  surveyId: string;
  questionId: string;
  value: string;
}): void => {
  const surveyState = getSurveyState(surveyId) ?? {};
  const questionState = surveyState[questionId] ?? {};
  surveyState[questionId] = { ...questionState, textResponse: value };
  surveyStates.set(surveyId, surveyState);
  debouncedPersistSurveyState(surveyId);
};

export const setOptionValue = ({
  surveyId,
  questionId,
  optionId,
  selected,
  clearPrevious,
}: {
  surveyId: string;
  questionId: string;
  optionId: string;
  selected: boolean;
  clearPrevious: boolean;
}): void => {
  const surveyState = getSurveyState(surveyId) ?? {};
  const questionState = surveyState[questionId] ?? {};
  const optionIds = clearPrevious ? new Set<string>() : new Set(questionState.optionIds ?? []);
  if (clearPrevious) questionState.otherSelected = false;
  if (selected) {
    optionIds.add(optionId);
  } else {
    optionIds.delete(optionId);
  }
  surveyState[questionId] = { ...questionState, optionIds: Array.from(optionIds) };
  surveyStates.set(surveyId, surveyState);
  debouncedPersistSurveyState(surveyId);
};

export const setOtherSelected = ({
  questionId,
  selected,
  surveyId,
  clearOptions,
}: {
  surveyId: string;
  questionId: string;
  selected: boolean;
  clearOptions: boolean;
}): void => {
  const surveyState = getSurveyState(surveyId) ?? {};
  const questionState = surveyState[questionId] ?? {};
  questionState.otherSelected = selected;
  if (clearOptions) questionState.optionIds = [];
  surveyState[questionId] = questionState;
  surveyStates.set(surveyId, surveyState);
  debouncedPersistSurveyState(surveyId);
};

export const setClickedLink = ({
  questionId,
  surveyId,
}: {
  surveyId: string;
  questionId: string;
}): void => {
  const surveyState = getSurveyState(surveyId) ?? {};
  const questionState = surveyState[questionId] ?? {};
  questionState.clickedLink = true;
  surveyState[questionId] = questionState;
  surveyStates.set(surveyId, surveyState);
  debouncedPersistSurveyState(surveyId);
};

export const getQuestionValue = (surveyId: string, questionId: string): string | undefined => {
  const surveyState = getSurveyState(surveyId);
  return surveyState?.[questionId]?.textResponse;
};

export const getOptionValue = (surveyId: string, questionId: string, optionId: string): boolean => {
  const surveyState = getSurveyState(surveyId);
  const optionIds = surveyState?.[questionId]?.optionIds ?? [];
  return optionIds.includes(optionId);
};

export const getOtherSelected = (surveyId: string, questionId: string): boolean => {
  const surveyState = getSurveyState(surveyId);
  return surveyState?.[questionId]?.otherSelected ?? false;
};
