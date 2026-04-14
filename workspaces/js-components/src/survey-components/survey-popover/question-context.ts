import type { SurveyQuestion } from "@flows/shared";
import { signal } from "@preact/signals-core";

type QuestionState = {
  value?: string;
  optionIds: string[];
  otherSelected: boolean;
};
type QuestionContext = QuestionState & {
  refresh: () => void;
};

export const currentQuestionValue = signal<SurveyQuestion>();

export const questionToContextValue = (question: SurveyQuestion): QuestionState => ({
  value: "getValue" in question ? question.getValue() : undefined,
  optionIds: "getSelectedOptionIds" in question ? question.getSelectedOptionIds() : [],
  otherSelected: "getOtherSelected" in question ? question.getOtherSelected() : false,
});

export const getDefaultQuestionState = (): QuestionState => ({
  value: "",
  optionIds: [],
  otherSelected: false,
});

export const questionState = signal<QuestionState>(getDefaultQuestionState());

export const useQuestionContext = (): QuestionContext => {
  const state = questionState.value;

  const refresh = (): void => {
    const currentQuestion = currentQuestionValue.value;
    if (currentQuestion) {
      questionState.value = questionToContextValue(currentQuestion);
    } else {
      questionState.value = getDefaultQuestionState();
    }
  };

  return {
    ...state,
    refresh,
  };
};
