import type { SingleChoiceQuestion } from "@flows/shared/src/types/survey";
import { OtherOption } from "./open-option";
import { useState } from "react";

type Props = {
  currentQuestion: SingleChoiceQuestion;
  onAnswer: () => void;
  legendId: string;
  descriptionId: string;
};

export const SingleChoiceInput = ({
  currentQuestion,
  onAnswer,
  legendId,
  descriptionId,
}: Props) => {
  const [selected, setSelected] = useState(currentQuestion.getInitialValue());
  const [otherSelected, setOtherSelected] = useState(currentQuestion.getInitialOtherSelected());

  return (
    <div
      className="flows_basicsV2_survey_popover_option_list"
      role="radiogroup"
      aria-labelledby={legendId}
      aria-describedby={descriptionId}
    >
      {currentQuestion.options.map((option) => {
        const isSelected = !otherSelected && selected === option.label;
        return (
          <button
            key={option.id}
            role="radio"
            type="button"
            aria-checked={isSelected}
            className="flows_basicsV2_survey_popover_choice_option"
            data-selected={isSelected ? "true" : "false"}
            onClick={() => {
              option.setSelected(true);
              currentQuestion.setValue(option.label);
              setSelected(option.label);
              onAnswer();
              if (otherSelected) {
                currentQuestion.setOtherSelected(false);
                setOtherSelected(false);
              }
            }}
          >
            <span className="flows_basicsV2_survey_popover_radio_indicator" />
            {option.label}
          </button>
        );
      })}
      {currentQuestion.otherOption && (
        <OtherOption
          type="radio"
          currentQuestion={currentQuestion}
          otherSelected={otherSelected}
          onSelect={() => {
            setOtherSelected(true);
            setSelected(undefined);
          }}
          onDeselect={() => setOtherSelected(false)}
        />
      )}
    </div>
  );
};
