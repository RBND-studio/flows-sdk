import type { MultipleChoiceQuestion } from "@flows/shared/src/types/survey";
import { useState } from "react";
import { OpenOption } from "./open-option";

type Props = {
  currentQuestion: MultipleChoiceQuestion;
};

export const MultipleChoiceInput = ({ currentQuestion }: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(currentQuestion.options.map((o) => [o.id, o.getInitialSelected()])),
  );
  const [openSelected, setOpenSelected] = useState(currentQuestion.getInitialOpenSelected());

  return (
    <div className="flows_basicsV2_survey_option_list">
      {currentQuestion.options.map((option) => (
        <button
          key={option.id}
          className="flows_basicsV2_survey_popover_choice_option"
          data-selected={selectedOptions[option.id] ? "true" : "false"}
          onClick={() => {
            const next = !selectedOptions[option.id];
            option.setSelected(next);
            setSelectedOptions((prev) => ({ ...prev, [option.id]: next }));
          }}
        >
          {option.label}
        </button>
      ))}
      {currentQuestion.openOption && (
        <OpenOption
          currentQuestion={currentQuestion}
          openSelected={openSelected}
          onSelect={() => setOpenSelected(true)}
          onDeselect={() => setOpenSelected(false)}
        />
      )}
    </div>
  );
};
