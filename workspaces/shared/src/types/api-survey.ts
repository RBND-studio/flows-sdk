export type ApiSurveyQuestionOption = {
  id: string;
  label: string;
};

export type QuestionType =
  | "freeform"
  | "single-choice"
  | "multiple-choice"
  | "rating"
  | "link"
  | "end-screen";

export type ApiSurveyQuestion = {
  id: string;
  type: QuestionType;

  title: string;
  description: string;
  lowerBoundLabel?: string;
  upperBoundLabel?: string;
  otherLabel?: string;
  linkLabel?: string;
  url?: string;
  textPlaceholder?: string;

  optional: boolean;
  shuffleOptions?: boolean;
  otherOption?: boolean;
  displayType?: string;
  minValue?: number;
  maxValue?: number;
  openInNew?: boolean;
  options?: ApiSurveyQuestionOption[];
};

export type ApiSurvey = {
  id: string;
  /**
   * blockStateId is null if the block state doesn't exist, for example when the survey block is part of block-state property
   */
  blockStateId: string | null;
  questions: ApiSurveyQuestion[];
};

// POST /v2/sdk/survey

export type ApiSurveyQuestionAnswer = {
  questionId: string;
  textResponse?: string;
  clickedLink?: boolean;
  otherSelected?: boolean;
  optionIds?: string[];
};

export type ApiSurveyAnswer = {
  userId: string;
  environment: string;
  organizationId: string;
  surveyId: string;
  blockStateId: string;
  questions: ApiSurveyQuestionAnswer[];
  url: string;
};
