import { isSurveyQuestionAnswered, type SurveyQuestion } from "@flows/shared";
import type { TemplateResult } from "lit";
import { html } from "lit";
import { Button } from "../../internal-components/button";
import type { IQuestionContext } from "./question-context";

type Props = {
  question: SurveyQuestion;
  onClick: () => void;
  label: string;
  context: IQuestionContext;
};

export const SurveyNextButton = ({ question, onClick, label, context }: Props): TemplateResult => {
  const { value, optionIds, otherSelected } = context;

  const disabled = question.optional
    ? false
    : !isSurveyQuestionAnswered({
        question,
        value,
        otherSelected,
        optionIdsLength: optionIds.length,
      });

  return html`<div class="flows_basicsV2_survey_popover_footer">
    ${Button({
      className: "flows_basicsV2_survey_popover_submit",
      variant: "primary",
      disabled,
      onClick,
      children: label,
    })}
  </div>`;
};
