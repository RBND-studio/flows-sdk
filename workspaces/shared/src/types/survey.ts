export type QuestionBase<T extends string> = {
  /**
   * Unique identifier for the question.
   */
  id: string;

  /**
   * Type of the question. E.g. freeform, single-choice, rating, etc.
   */
  type: T;
  /**
   * Title of the question, can contain HTML.
   */
  title: string;
  /**
   * Description of the question, can contain HTML.
   */
  description: string;
  /**
   * When true, the question does not have to be answered in order to proceed with the survey. Only relevant for questions with inputs (e.g. freeform, single-choice, multiple-choice, rating).
   */
  optional: boolean;
};

export type FreeformQuestion = QuestionBase<"freeform"> & {
  /**
   * Placeholder text for the freeform question input field. This is the text that will be displayed in the input field when it is empty.
   */
  placeholder: string;

  /**
   * Method for getting the current text value for the freeform question.
   */
  getValue: () => string | undefined;
  /**
   * Method for setting the current text value for the freeform question.
   */
  setValue: (value: string) => void;
};

type QuestionOption = {
  /**
   * Unique identifier for the option. The id is used for state management using the `getSelectedOptionIds` and `setSelectedOptionIds` methods provided in choice question types.
   */
  id: string;
  /**
   * Label for the option. This is the text that will be displayed to the user.
   */
  label: string;
};

export type SingleChoiceQuestion = QuestionBase<"single-choice"> & {
  /**
   * List of options to choose from in the single choice question. Each option has an id and a label.
   */
  options: QuestionOption[];
  /**
   * When true, an additional "other" option should be displayed to the user. Label for the "other" option is provided in the `otherLabel` property.
   */
  otherOption: boolean;
  /**
   * Label for the "other" option that can be displayed to the user when `otherOption` property is true.
   */
  otherLabel: string;

  /**
   * Method for getting the current state of the selected option ids for the question. For single choice questions, the array will contain zero or one option id.
   */
  getSelectedOptionIds: () => string[];
  /**
   * Method for setting the current state of the selected option ids for the question. For single choice questions, the array should contain zero or one option id.
   */
  setSelectedOptionIds: (optionIds: string[]) => void;
  /**
   * Method for getting the current text value of "other" option input. This is relevant only when `otherOption` is enabled.
   */
  getValue: () => string | undefined;
  /**
   * Method for setting the current text value of "other" option input. This is relevant only when `otherOption` is enabled.
   */
  setValue: (value: string) => void;
  /**
   * Method for getting the current state of the "other" option selection. This is relevant only when `otherOption` is enabled.
   */
  getOtherSelected: () => boolean;
  /**
   * Method for setting the current state of the "other" option selection. This is relevant only when `otherOption` is enabled.
   */
  setOtherSelected: (selected: boolean) => void;
};

export type MultipleChoiceQuestion = QuestionBase<"multiple-choice"> & {
  /**
   * List of options to choose from in the multiple choice question. Each option has an id and a label.
   */
  options: QuestionOption[];
  /**
   * When true, an additional "other" option should be displayed to the user. Label for the "other" option is provided in the `otherLabel` property.
   */
  otherOption: boolean;
  /**
   * Label for the "other" option that can be displayed to the user when `otherOption` property is true.
   */
  otherLabel: string;

  /**
   * Method for getting the current state of the selected option ids for the question. For multiple choice questions, the array can contain zero or more option ids.
   */
  getSelectedOptionIds: () => string[];
  /**
   * Method for setting the current state of the selected option ids for the question. For multiple choice questions, the array can contain zero or more option ids.
   */
  setSelectedOptionIds: (optionIds: string[]) => void;
  /**
   * Method for getting the current text value of "other" option input. This is relevant only when `otherOption` is enabled.
   */
  getValue: () => string | undefined;
  /**
   * Method for setting the current text value of "other" option input. This is relevant only when `otherOption` is enabled.
   */
  setValue: (value: string) => void;
  /**
   * Method for getting the current state of the "other" option selection. This is relevant only when `otherOption` is enabled.
   */
  getOtherSelected: () => boolean;
  /**
   * Method for setting the current state of the "other" option selection. This is relevant only when `otherOption` is enabled.
   */
  setOtherSelected: (selected: boolean) => void;
};

export type RatingDisplayType = "numbers" | "stars" | "emojis";
export type RatingQuestion = QuestionBase<"rating"> & {
  /**
   * Display type of the rating option buttons, e.g. numbers, stars or emojis.
   */
  displayType: RatingDisplayType;
  /**
   * Lower bound of the rating scale. This is the minimum rating value that can be selected by the user.
   */
  minValue: number;
  /**
   * Upper bound of the rating scale. This is the maximum rating value that can be selected by the user.
   */
  maxValue: number;
  /**
   * Label for the lower bound of the rating scale e.g. "Not satisfied".
   */
  lowerBoundLabel: string;
  /**
   * Label for the upper bound of the rating scale e.g. "Very satisfied".
   */
  upperBoundLabel: string;

  /**
   * Method for getting the current rating value selected by the user. The value is a string number between the defined lower and upper bounds of the rating scale.
   * @returns e.g. `"2"` or `undefined`
   */
  getValue: () => string | undefined;
  /**
   * Method for setting the current rating value selected by the user. The value should be a string number between the defined lower and upper bounds of the rating scale.
   */
  setValue: (value: string) => void;
};

export type LinkQuestion = QuestionBase<"link"> & {
  /**
   * Label for the link in the question.
   */
  linkLabel: string;
  /**
   * URL that the user will be navigated to when they click the link in the question.
   */
  url: string;
  /**
   * When true, the link will be opened in a new tab when clicked.
   */
  openInNew: boolean;

  /**
   * Method for marking the link question as clicked.
   */
  setClicked: () => void;
};

export type EndScreenQuestion = QuestionBase<"end-screen"> & {
  /**
   * Label for the link in the end screen question.
   */
  linkLabel: string;
  /**
   * URL that the user will be navigated to when they click the link in the end screen question.
   */
  url: string;
  /**
   * When true, the link will be opened in a new tab when clicked.
   */
  openInNew: boolean;
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
  /**
   * Ordered list of questions in the survey. The current question is determined based on the current question index that you can get and update using the provided methods.
   */
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
   * Submits the survey response and keeps the component visible. You need to call `complete` exit node method to exit the survey block after submission.
   *
   * When using end screen question type and built-in question navigation (with `nextQuestion` method), the survey is submitted automatically.
   */
  submit: () => Promise<void>;
};
