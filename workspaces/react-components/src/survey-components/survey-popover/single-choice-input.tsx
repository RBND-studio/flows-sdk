import type { SingleChoiceQuestion } from "@flows/shared/src/types/survey";
import { OpenOption } from "./open-option";
import { useState } from "react";

type Props = {
  currentQuestion: SingleChoiceQuestion;
  onAnswer: () => void;
};

export const SingleChoiceInput = ({ currentQuestion, onAnswer }: Props) => {
  const [selected, setSelected] = useState(currentQuestion.getInitialValue());
  const [openSelected, setOpenSelected] = useState(currentQuestion.getInitialOpenSelected());

  return (
    <div className="flows_basicsV2_survey_option_list">
      {currentQuestion.options.map((option) => (
        <button
          key={option.id}
          className="flows_basicsV2_survey_popover_choice_option"
          data-selected={!openSelected && selected === option.label ? "true" : "false"}
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
          {option.label}
        </button>
      ))}
      {currentQuestion.openOption && (
        <OpenOption
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
