export type QuestionBase<T extends string> = {
  id: string;
  type: T;
  title: string;
  description: string;
  optional: boolean;
};

type FreeformQuestion = QuestionBase<"freeform"> & {
  initialValue?: string;
  setValue: (value: string) => void;
};

type QuestionOption = {
  id: string;
  label: string;

  initialSelected?: boolean;
  setSelected: (selected: boolean) => void;
};

type SingleChoiceQuestion = QuestionBase<"single-choice"> & {
  openOption?: boolean;
  shuffleOptions?: boolean;

  options: QuestionOption[];

  initialValue?: string;
  setValue: (value: string) => void;
};

export type SurveyQuestion = FreeformQuestion | SingleChoiceQuestion;
export type SurveyQuestionType = SurveyQuestion["type"];

export type Survey = {
  questions: SurveyQuestion[];
};
