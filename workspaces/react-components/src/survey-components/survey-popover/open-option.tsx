import type { MultipleChoiceQuestion, SingleChoiceQuestion } from "@flows/shared/src/types/survey";
import type { FC } from "react";

export const OtherOption: FC<{
  currentQuestion: SingleChoiceQuestion | MultipleChoiceQuestion;
  otherSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  type: "radio" | "checkbox";
}> = ({ currentQuestion, otherSelected, onSelect, onDeselect, type }) => {
  const handleClick = () => {
    if (!otherSelected) {
      currentQuestion.setOtherSelected(true);
      currentQuestion.setValue("");
      onSelect();
    } else {
      // Move focus to input if user clicks outside of the input
      setTimeout(() => {
        const input = document.getElementById(currentQuestion.id + "-open-input");
        input?.focus();
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flows_basicsV2_survey_popover_choice_option flows_basicsV2_survey_popover_other_option"
      data-selected={otherSelected ? "true" : "false"}
      role={type === "radio" ? "radio" : "checkbox"}
      aria-checked={otherSelected}
    >
      <span
        className={
          type === "radio"
            ? "flows_basicsV2_survey_popover_radio_indicator"
            : "flows_basicsV2_survey_popover_checkbox_indicator"
        }
      />
      {otherSelected ? (
        <input
          ref={(el) => el?.focus()}
          type="text"
          id={currentQuestion.id + "-open-input"}
          className="flows_basicsV2_survey_popover_other_option_input"
          onChange={(e) => currentQuestion.setValue(e.target.value)}
          defaultValue={currentQuestion.getInitialValue()}
          onBlur={(e) => {
            if (!e.target.value) {
              currentQuestion.setOtherSelected(false);
              onDeselect();
            }
          }}
        />
      ) : (
        currentQuestion.otherLabel
      )}
    </button>
  );
};
