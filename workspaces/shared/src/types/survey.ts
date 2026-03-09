export type QuestionBase<T extends string> = {
  id: string;
  type: T;
  title: string;
  description: string;
  optional: boolean;
};

type FreeformQuestion = QuestionBase<"freeform"> & {
  placeholder?: string;
  getInitialValue: () => string | undefined;
  setValue: (value: string) => void;
};

type QuestionOption = {
  id: string;
  label: string;

  getInitialSelected: () => boolean;
  setSelected: (selected: boolean) => void;
};

export type SingleChoiceQuestion = QuestionBase<"single-choice"> & {
  openOption: boolean;
  openLabel: string;

  options: QuestionOption[];

  getInitialValue: () => string | undefined;
  setValue: (value: string) => void;
  getInitialOpenSelected: () => boolean;
  setOpenSelected: (selected: boolean) => void;
};

export type MultipleChoiceQuestion = QuestionBase<"multiple-choice"> & {
  openOption: boolean;
  openLabel: string;

  options: QuestionOption[];

  getInitialValue: () => string | undefined;
  setValue: (value: string) => void;
  getInitialOpenSelected: () => boolean;
  setOpenSelected: (selected: boolean) => void;
};

export type RatingDisplayType = "numbers" | "stars";
export type RatingQuestion = QuestionBase<"rating"> & {
  displayType: RatingDisplayType;
  scale: number;
  lowerBoundLabel: string;
  upperBoundLabel: string;

  getInitialValue: () => string | undefined;
  setValue: (value: string) => void;
};

export type LinkQuestion = QuestionBase<"link"> & {
  url: string;
  openInNew: boolean;
  linkLabel: string;

  setClicked: () => void;
};

export type SurveyQuestion =
  | FreeformQuestion
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | RatingQuestion
  | LinkQuestion;
export type SurveyQuestionType = SurveyQuestion["type"];

export type Survey = {
  questions: SurveyQuestion[];
};
