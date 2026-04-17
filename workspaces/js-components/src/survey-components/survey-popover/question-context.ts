import type { SurveyQuestion } from "@flows/shared";

export type IQuestionContext = {
  value?: string;
  optionIds: string[];
  otherSelected: boolean;
  refresh: () => void;
};
export type QuestionContextData = Omit<IQuestionContext, "refresh">;

export const questionToContextValue = (question: SurveyQuestion): QuestionContextData => ({
  value: "getValue" in question ? question.getValue() : undefined,
  optionIds: "getSelectedOptionIds" in question ? question.getSelectedOptionIds() : [],
  otherSelected: "getOtherSelected" in question ? question.getOtherSelected() : false,
});

export const getDefaultQuestionState = (): QuestionContextData => ({
  value: "",
  optionIds: [],
  otherSelected: false,
});
