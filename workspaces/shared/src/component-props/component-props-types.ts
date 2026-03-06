import type { ApiSurveyAnswer } from "../types/api-survey";

export type SetStateMemory = (props: {
  key: string;
  value: boolean;
  blockId: string;
}) => Promise<void>;
export type ExitNodeCb = (props: { key: string; blockId: string }) => Promise<void>;
export type SubmitSurvey = (
  props: Pick<ApiSurveyAnswer, "surveyId" | "submitType" | "questions">,
) => Promise<void>;
