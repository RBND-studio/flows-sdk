export type ApiSurveyQuestionOption = {
  id: string;
  label: string;
};

export type ApiSurveyQuestion = {
  id: string;
  type: string;

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
  scale?: number;
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
