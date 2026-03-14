import type { MultipleChoiceQuestion } from "@flows/shared/src/types/survey";
import { useState } from "react";
import { OtherOption } from "./open-option";

type Props = {
  currentQuestion: MultipleChoiceQuestion;
  legendId: string;
  descriptionId: string;
};

export const MultipleChoiceInput = ({ currentQuestion, legendId, descriptionId }: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(currentQuestion.options.map((o) => [o.id, o.getInitialSelected()])),
  );
  const [otherSelected, setOtherSelected] = useState(currentQuestion.getInitialOtherSelected());

  return (
    <div
      className="flows_basicsV2_survey_popover_option_list"
      aria-labelledby={legendId}
      aria-describedby={descriptionId}
    >
      {currentQuestion.options.map((option) => {
        const isSelected = !!selectedOptions[option.id];
        return (
          <button
            key={option.id}
            // oxlint-disable-next-line jsx_a11y/prefer-tag-over-role -- intentionally using button
            role="checkbox"
            aria-checked={isSelected}
            className="flows_basicsV2_survey_popover_choice_option"
            data-selected={isSelected ? "true" : "false"}
            onClick={() => {
              const next = !isSelected;
              option.setSelected(next);
              setSelectedOptions((prev) => ({ ...prev, [option.id]: next }));
            }}
          >
            <span className="flows_basicsV2_survey_popover_checkbox_indicator" />
            {option.label}
          </button>
        );
      })}
      {currentQuestion.otherOption && (
        <OtherOption
          type="checkbox"
          currentQuestion={currentQuestion}
          otherSelected={otherSelected}
          onSelect={() => setOtherSelected(true)}
          onDeselect={() => setOtherSelected(false)}
        />
      )}
    </div>
  );
};
