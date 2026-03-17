import type { FC, ReactNode } from "react";
import { createContext, use, useCallback, useState } from "react";
import type { SurveyQuestion } from "@flows/shared";

type IQuestionContext = {
  value?: string;
  optionIds: string[];
  otherSelected: boolean;

  refresh: () => void;
};
type ContextData = Omit<IQuestionContext, "refresh">;

const questionToContextValue = (question: SurveyQuestion): ContextData => ({
  value: "getValue" in question ? question.getValue() : undefined,
  optionIds: "getSelectedOptionIds" in question ? question.getSelectedOptionIds() : [],
  otherSelected: "getOtherSelected" in question ? question.getOtherSelected() : false,
});

const noop = () => {};

const QuestionContext = createContext<IQuestionContext>({
  value: "",
  optionIds: [],
  otherSelected: false,
  refresh: noop,
});

type Props = {
  children: ReactNode;
  question: SurveyQuestion;
};
export const QuestionProvider: FC<Props> = ({ children, question }) => {
  const [questionState, setQuestionState] = useState<ContextData>(questionToContextValue(question));
  const refresh = useCallback(() => {
    setQuestionState(questionToContextValue(question));
  }, [question]);

  return (
    <QuestionContext.Provider value={{ ...questionState, refresh }}>
      {children}
    </QuestionContext.Provider>
  );
};

export const useQuestionContext = () => use(QuestionContext);
