import type { SingleChoiceQuestion } from "@flows/shared/src/types/survey";
import { OpenOption } from "./open-option";
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
  const [openSelected, setOpenSelected] = useState(currentQuestion.getInitialOpenSelected());

  return (
    <div
      className="flows_basicsV2_survey_popover_option_list"
      role="radiogroup"
      aria-labelledby={legendId}
      aria-describedby={descriptionId}
    >
      {currentQuestion.options.map((option) => {
        const isSelected = !openSelected && selected === option.label;
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
              if (openSelected) {
                currentQuestion.setOpenSelected(false);
                setOpenSelected(false);
              }
            }}
          >
            <span className="flows_basicsV2_survey_popover_radio_indicator" />
            {option.label}
          </button>
        );
      })}
      {currentQuestion.openOption && (
        <OpenOption
          type="radio"
          currentQuestion={currentQuestion}
          openSelected={openSelected}
          onSelect={() => {
            setOpenSelected(true);
            setSelected(undefined);
          }}
          onDeselect={() => setOpenSelected(false)}
        />
      )}
    </div>
  );
};
