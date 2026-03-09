import type { SurveyQuestion } from "@flows/shared/src/types/survey";
import { Text } from "../../internal-components/text";
import { useState } from "react";

type Props = {
  currentQuestion: SurveyQuestion;
  onAnswer: () => void;
};

export const RatingQuestion = ({ currentQuestion, onAnswer }: Props) => {
  if (currentQuestion.type !== "rating") return null;

  const [selected, setSelected] = useState(currentQuestion.getInitialValue());

  const handleSetValue = (value: string) => {
    setSelected(value);
    currentQuestion.setValue(value);
    onAnswer();
  };

  return (
    <>
      <div className="flows_basicsV2_survey_rating_list">
        {Array(currentQuestion.scale)
          .fill(null)
          .map((_, i) => (
            <button
              className="flows_basicsV2_survey_rating_option"
              onClick={() => {
                handleSetValue(i.toString());
              }}
              key={i}
              data-selected={selected === i.toString() ? "true" : "false"}
            >
              {i + 1}
            </button>
          ))}
      </div>
      {currentQuestion.upperBoundLabel && currentQuestion.lowerBoundLabel && (
        <div className="flows_basicsV2_survey_bound_labels">
          <Text variant="body">{currentQuestion.lowerBoundLabel}</Text>
          <Text variant="body">{currentQuestion.upperBoundLabel}</Text>
        </div>
      )}
    </>
  );
};
