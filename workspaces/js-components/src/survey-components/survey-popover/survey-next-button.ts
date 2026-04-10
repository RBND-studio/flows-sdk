import type { SurveyQuestion } from "@flows/shared";
import type { TemplateResult } from "lit";
import { html } from "lit";
import { Button } from "../../internal-components/button";
import { useQuestionContext } from "./question-context";

type Props = {
  question: SurveyQuestion;
  onClick: () => void;
  label: string;
};

export const SurveyNextButton = ({ question, onClick, label }: Props): TemplateResult => {
  const { value, optionIds, otherSelected } = useQuestionContext();

  const disabled = (() => {
    if (question.optional) return false;

    if (question.type === "freeform") {
      return !value?.trim();
    }
    if (question.type === "rating") {
      return !value?.trim();
    }
    if (question.type === "single-choice" || question.type === "multiple-choice") {
      const otherOptionFilled = otherSelected && value?.trim();
      return !optionIds.length && !otherOptionFilled;
    }
  })();

  return html` <div class="flows_basicsV2_survey_popover_footer">
    ${Button({
      className: "flows_basicsV2_survey_popover_submit",
      variant: "primary",
      disabled,
      onClick,
      children: label,
    })}
  </div>`;
};
