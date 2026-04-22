import { type FC } from "react";
import { Button } from "../../internal-components/button";
import { useQuestionContext } from "./question-context";
import { isSurveyQuestionAnswered, type SurveyQuestion } from "@flows/shared";

type Props = {
  question: SurveyQuestion;
  onClick: () => void;
  label: string;
};

export const SurveyNextButton: FC<Props> = ({ onClick, label, question }) => {
  const { value, optionIds, otherSelected } = useQuestionContext();

  const disabled = question.optional
    ? false
    : !isSurveyQuestionAnswered({
        question,
        value,
        otherSelected,
        optionIdsLength: optionIds.length,
      });

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
