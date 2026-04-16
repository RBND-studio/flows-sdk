import type { SurveyQuestion } from "@flows/shared";
import { signal } from "@preact/signals-core";

type IQuestionContext = {
  value?: string;
  optionIds: string[];
  otherSelected: boolean;

  refresh: () => void;
};
type ContextData = Omit<IQuestionContext, "refresh">;

export const questionToContextValue = (question: SurveyQuestion): ContextData => ({
  value: "getValue" in question ? question.getValue() : undefined,
  optionIds: "getSelectedOptionIds" in question ? question.getSelectedOptionIds() : [],
  otherSelected: "getOtherSelected" in question ? question.getOtherSelected() : false,
});

export const getDefaultQuestionState = (): ContextData => ({
  value: "",
  optionIds: [],
  otherSelected: false,
});

export const currentQuestionSignal = signal<SurveyQuestion>();
export const questionState = signal<ContextData>(getDefaultQuestionState());

const refresh = (): void => {
  const currentQuestion = currentQuestionSignal.value;
  if (currentQuestion) {
    questionState.value = questionToContextValue(currentQuestion);
  } else {
    questionState.value = getDefaultQuestionState();
  }
};

export const useQuestionContext = (): IQuestionContext => {
  const state = questionState.value;

  return {
    ...state,
    refresh,
  };
};
