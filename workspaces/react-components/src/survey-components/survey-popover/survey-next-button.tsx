import { useMemo, type FC } from "react";
import { Button } from "../../internal-components/button";
import { useQuestionContext } from "./question-context";
import type { SurveyQuestion } from "@flows/shared";

type Props = {
  question: SurveyQuestion;
  onClick: () => void;
  label: string;
};

export const SurveyNextButton: FC<Props> = ({ onClick, label, question }) => {
  const { value, optionIds, otherSelected } = useQuestionContext();

  const disabled = useMemo(() => {
    if (question.optional) return false;

    if (question.type === "freeform") {
      return !value?.trim();
    }
    if (question.type === "single-choice" || question.type === "multiple-choice") {
      const otherOptionFilled = otherSelected && value?.trim();
      return !optionIds.length && !otherOptionFilled;
    }
    if (question.type === "rating") {
      return value === undefined;
    }
  }, [question.type, value, optionIds, otherSelected, question.optional]);

  return (
    <div className="flows_basicsV2_survey_popover_footer">
      <Button
        className="flows_basicsV2_survey_popover_submit"
        variant="primary"
        disabled={disabled}
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
};
