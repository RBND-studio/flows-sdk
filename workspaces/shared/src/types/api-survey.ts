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
  openLabel?: string;
  linkLabel?: string;
  url?: string;

  optional: boolean;
  shuffleOptions?: boolean;
  openOption?: boolean;
  displayType?: string;
  scale?: number;
  openInNew?: boolean;
  options?: ApiSurveyQuestionOption[];
};

export type ApiSurvey = {
  id: string;
  questions: ApiSurveyQuestion[];
};
