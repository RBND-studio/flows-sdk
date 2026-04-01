export type QuestionBase<T extends string> = {
  /**
   * Unique identifier for the question.
   */
  id: string;

  /**
   * Type of the question, e.g. `freeform`, `single-choice`, `rating`.
   */
  type: T;
  /**
   * Title of the question. May contain HTML.
   */
  title: string;
  /**
   * Description of the question. May contain HTML.
   */
  description: string;
  /**
   * When true, the user may skip this question without providing an answer.
   * Only applies to questions with user input: `freeform`, `single-choice`, `multiple-choice`, and `rating`.
   */
  optional: boolean;
};

export type FreeformQuestion = QuestionBase<"freeform"> & {
  /**
   * Placeholder text for the freeform question input field, shown when the field is empty.
   */
  placeholder: string;

  /**
   * Returns the current text value entered by the user for the freeform question,
   * or `undefined` if the field has not been filled in yet.
   */
  getValue: () => string | undefined;
  /**
   * Sets the current text value for the freeform question.
   * @param value - The text to set as the current input value.
   */
  setValue: (value: string) => void;
};

type QuestionOption = {
  /**
   * Unique identifier for the option. Used to track selection state via the
   * `getSelectedOptionIds` and `setSelectedOptionIds` methods on choice question types.
   */
  id: string;
  /**
   * Display label shown to the user for this option.
   */
  label: string;
};

export type SingleChoiceQuestion = QuestionBase<"single-choice"> & {
  /**
   * Ordered list of available options for the single-choice question.
   */
  options: QuestionOption[];
  /**
   * When true, an additional "other" option should be rendered. Its label is provided in `otherLabel`.
   * When the user selects "other", also show a text input — use `getValue`/`setValue` for its value
   * and `getOtherSelected`/`setOtherSelected` to track whether it is selected.
   */
  otherOption: boolean;
  /**
   * Label for the "other" option. Only relevant when `otherOption` is true.
   */
  otherLabel: string;

  /**
   * Returns the currently selected option id as a single-element array,
   * or an empty array if no option is selected.
   * For single-choice questions, the array will never contain more than one id.
   */
  getSelectedOptionIds: () => string[];
  /**
   * Sets the currently selected option for the single-choice question.
   * Pass a single-element array with the option id to select it, or an empty array to deselect.
   * @param optionIds - Array containing zero or one option id.
   */
  setSelectedOptionIds: (optionIds: string[]) => void;
  /**
   * Returns the current text entered in the "other" option input field,
   * or `undefined` if it has not been filled in. Only relevant when `otherOption` is true.
   */
  getValue: () => string | undefined;
  /**
   * Sets the text value of the "other" option input field. Only relevant when `otherOption` is true.
   * @param value - The text to set as the current "other" input value.
   */
  setValue: (value: string) => void;
  /**
   * Returns whether the "other" option is currently selected. Only relevant when `otherOption` is true.
   */
  getOtherSelected: () => boolean;
  /**
   * Sets whether the "other" option is selected. Only relevant when `otherOption` is true.
   * @param selected - Pass `true` to select the "other" option, `false` to deselect it.
   */
  setOtherSelected: (selected: boolean) => void;
};

export type MultipleChoiceQuestion = QuestionBase<"multiple-choice"> & {
  /**
   * Ordered list of available options for the multiple-choice question.
   */
  options: QuestionOption[];
  /**
   * When true, an additional "other" option should be rendered. Its label is provided in `otherLabel`.
   * When the user selects "other", also show a text input — use `getValue`/`setValue` for its value
   * and `getOtherSelected`/`setOtherSelected` to track whether it is selected.
   */
  otherOption: boolean;
  /**
   * Label for the "other" option. Only relevant when `otherOption` is true.
   */
  otherLabel: string;

  /**
   * Returns the ids of all currently selected options.
   * For multiple-choice questions, the array can contain zero or more option ids.
   */
  getSelectedOptionIds: () => string[];
  /**
   * Sets the currently selected options for the multiple-choice question.
   * Pass an array of option ids to select them, or an empty array to deselect all.
   * @param optionIds - Array of selected option ids.
   */
  setSelectedOptionIds: (optionIds: string[]) => void;
  /**
   * Returns the current text entered in the "other" option input field,
   * or `undefined` if it has not been filled in. Only relevant when `otherOption` is true.
   */
  getValue: () => string | undefined;
  /**
   * Sets the text value of the "other" option input field. Only relevant when `otherOption` is true.
   * @param value - The text to set as the current "other" input value.
   */
  setValue: (value: string) => void;
  /**
   * Returns whether the "other" option is currently selected. Only relevant when `otherOption` is true.
   */
  getOtherSelected: () => boolean;
  /**
   * Sets whether the "other" option is selected. Only relevant when `otherOption` is true.
   * @param selected - Pass `true` to select the "other" option, `false` to deselect it.
   */
  setOtherSelected: (selected: boolean) => void;
};

export type RatingDisplayType = "numbers" | "stars" | "emojis";
export type RatingQuestion = QuestionBase<"rating"> & {
  /**
   * Visual style of the rating buttons in the rating question.
   */
  displayType: RatingDisplayType;
  /**
   * Minimum selectable value on the rating scale.
   */
  minValue: number;
  /**
   * Maximum selectable value on the rating scale.
   */
  maxValue: number;
  /**
   * Label shown at the low end of the rating scale, e.g. `"Not satisfied"`.
   */
  lowerBoundLabel: string;
  /**
   * Label shown at the high end of the rating scale, e.g. `"Very satisfied"`.
   */
  upperBoundLabel: string;

  /**
   * Returns the rating value currently selected by the user as a numeric string,
   * or `undefined` if no rating has been selected yet.
   * The value will be within the range defined by `minValue` and `maxValue`.
   * @returns e.g. `"2"` or `undefined`
   */
  getValue: () => string | undefined;
  /**
   * Sets the currently selected rating value for the rating question.
   * The value must be a numeric string within the range defined by `minValue` and `maxValue`.
   * @param value - The rating value to select, e.g. `"3"`.
   */
  setValue: (value: string) => void;
};

export type LinkQuestion = QuestionBase<"link"> & {
  /**
   * Display label for the clickable link shown in the link question.
   */
  linkLabel: string;
  /**
   * URL the user is navigated to when they click the link.
   * Can be empty when the link question is used as an announcement only without navigation.
   */
  url: string;
  /**
   * When true, the link opens in a new browser tab.
   */
  openInNew: boolean;

  /**
   * Marks the link question as clicked. Call this when the user activates the link
   * so the interaction is recorded in the survey response.
   */
  setClicked: () => void;
};

export type EndScreenQuestion = QuestionBase<"end-screen"> & {
  /**
   * Display label for the optional link shown on the end screen.
   */
  linkLabel: string;
  /**
   * URL the user is navigated to when they click the link on the end screen.
   */
  url: string;
  /**
   * When true, the link opens in a new browser tab.
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
   * Ordered list of all questions in the survey. Use `getCurrentQuestionIndex` to determine
   * which question is currently active, and `nextQuestion`/`previousQuestion` to navigate between them.
   */
  questions: SurveyQuestion[];

  /**
   * Returns the zero-based index of the currently displayed question.
   * Use this to look up the active question in the `questions` array.
   * @returns Index of the current question, starting at `0`.
   */
  getCurrentQuestionIndex: () => number;
  /**
   * Advances to the next question in the survey and returns the new index.
   * If the user is already on the last question, this method does nothing and returns the current index.
   * @returns New question index after advancing.
   */
  nextQuestion: () => number;
  /**
   * Moves back to the previous question in the survey and returns the new index.
   * If the user is already on the first question, this method does nothing and returns the current index.
   * @returns New question index after moving back.
   */
  previousQuestion: () => number;
  /**
   * Submits the survey response. The survey component remains visible after submission —
   * call the `complete` exit node method to close the survey block.
   *
   * Note: when using the `end-screen` question type with built-in navigation via `nextQuestion`,
   * the survey is submitted automatically when the user reaches the end screen.
   */
  submit: () => Promise<void>;
};
