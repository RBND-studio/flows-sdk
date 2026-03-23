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

export type SurveySubmitType = "submit" | "partial";
export type ApiSurveyAnswer = {
  userId: string;
  environment: string;
  organizationId: string;
  surveyId: string;
  submitType: SurveySubmitType;
  questions: ApiSurveyQuestionAnswer[];
};
