import type { SurveyQuestion } from "@flows/shared/src/types/survey";
import { Text } from "../../internal-components/text";
import { useState } from "react";

type Props = {
  currentQuestion: SurveyQuestion;
  onAnswer: () => void;
  legendId: string;
  descriptionId: string;
};

export const RatingQuestion = ({ currentQuestion, onAnswer, legendId, descriptionId }: Props) => {
  if (currentQuestion.type !== "rating") return null;

  const [selected, setSelected] = useState(currentQuestion.getInitialValue());

  const handleSetValue = (value: string) => {
    setSelected(value);
    currentQuestion.setValue(value);
    onAnswer();
  };

  return (
    <>
      <div
        className="flows_basicsV2_survey_popover_rating_list"
        role="radiogroup"
        aria-labelledby={legendId}
        aria-describedby={descriptionId}
      >
        {Array(currentQuestion.scale)
          .fill(null)
          .map((_, i) => {
            const isSelected = selected === i.toString();
            return (
              <button
                className="flows_basicsV2_survey_popover_rating_option"
                role="radio"
                type="button"
                aria-checked={isSelected}
                aria-label={`${i + 1} out of ${currentQuestion.scale}`}
                onClick={() => {
                  handleSetValue(i.toString());
                }}
                key={i}
                data-selected={isSelected ? "true" : "false"}
              >
                {i + 1}
              </button>
            );
          })}
      </div>
      {currentQuestion.upperBoundLabel && currentQuestion.lowerBoundLabel && (
        <div className="flows_basicsV2_survey_popover_bound_labels">
          <Text variant="body">{currentQuestion.lowerBoundLabel}</Text>
          <Text variant="body">{currentQuestion.upperBoundLabel}</Text>
        </div>
      )}
    </>
  );
};
