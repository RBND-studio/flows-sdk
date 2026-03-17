export type QuestionBase<T extends string> = {
  id: string;
  type: T;
  title: string;
  description: string;
  optional: boolean;
};

export type FreeformQuestion = QuestionBase<"freeform"> & {
  placeholder?: string;
  getValue: () => string | undefined;
  setValue: (value: string) => void;
};

type QuestionOption = {
  id: string;
  label: string;
};

export type SingleChoiceQuestion = QuestionBase<"single-choice"> & {
  otherOption: boolean;
  otherLabel: string;

  options: QuestionOption[];

  getSelectedOptionIds: () => string[];
  setSelectedOptionIds: (optionIds: string[]) => void;
  getValue: () => string | undefined;
  setValue: (value: string) => void;
  getOtherSelected: () => boolean;
  setOtherSelected: (selected: boolean) => void;
};

export type MultipleChoiceQuestion = QuestionBase<"multiple-choice"> & {
  otherOption: boolean;
  otherLabel: string;

  options: QuestionOption[];

  getSelectedOptionIds: () => string[];
  setSelectedOptionIds: (optionIds: string[]) => void;
  getValue: () => string | undefined;
  setValue: (value: string) => void;
  getOtherSelected: () => boolean;
  setOtherSelected: (selected: boolean) => void;
};

export type RatingDisplayType = "numbers" | "stars" | "emojis";
export type RatingQuestion = QuestionBase<"rating"> & {
  displayType: RatingDisplayType;
  scale: number;
  lowerBoundLabel: string;
  upperBoundLabel: string;

  getValue: () => string | undefined;
  setValue: (value: string) => void;
};

export type LinkQuestion = QuestionBase<"link"> & {
  url: string;
  openInNew: boolean;
  linkLabel: string;

  setClicked: () => void;
};

export type EndScreenQuestion = QuestionBase<"end-screen"> & {
  url: string;
  openInNew: boolean;
  linkLabel: string;

  // TODO: should we add method like in LinkQuestion?
};

export type SurveyQuestion =
  | FreeformQuestion
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | RatingQuestion
  | LinkQuestion
  | EndScreenQuestion;
export type SurveyQuestionType = SurveyQuestion["type"];

export type Survey = {
  questions: SurveyQuestion[];

  /**
   * Get the current question index in the survey. The index is zero-based, so the first question has index 0.
   * @returns index of the current question in the survey
   */
  getCurrentQuestionIndex: () => number;
  /**
   * Proceed to the next question in the survey. If the user is on the last question already, this method does nothing.
   * @returns new question index
   */
  nextQuestion: () => number;
  /**
   * Proceed to the previous question in the survey. If the user is on the first question already, this method does nothing.
   * @returns new question index
   */
  previousQuestion: () => number;
  /**
   * Submits the survey response and keeps the component visible.
   */
  submit: () => Promise<void>;
};
