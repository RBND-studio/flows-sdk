import type { MultipleChoiceQuestion, SingleChoiceQuestion } from "@flows/shared/src/types/survey";
import type { FC } from "react";

export const OpenOption: FC<{
  currentQuestion: SingleChoiceQuestion | MultipleChoiceQuestion;
  openSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  type: "radio" | "checkbox";
}> = ({ currentQuestion, openSelected, onSelect, onDeselect, type }) => {
  const { openLabel } = currentQuestion;

  const handleClick = () => {
    if (!openSelected) {
      currentQuestion.setOpenSelected(true);
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
      className="flows_basicsV2_survey_popover_choice_option flows_basicsV2_survey_popover_open_option"
      data-selected={openSelected ? "true" : "false"}
      role={type === "radio" ? "radio" : "checkbox"}
      aria-checked={openSelected}
    >
      <span
        className={
          type === "radio"
            ? "flows_basicsV2_survey_popover_radio_indicator"
            : "flows_basicsV2_survey_popover_checkbox_indicator"
        }
      />
      {openSelected ? (
        <input
          ref={(el) => el?.focus()}
          type="text"
          id={currentQuestion.id + "-open-input"}
          className="flows_basicsV2_survey_popover_open_option_input"
          onChange={(e) => currentQuestion.setValue(e.target.value)}
          defaultValue={currentQuestion.getInitialValue()}
          onBlur={(e) => {
            if (!e.target.value) {
              currentQuestion.setOpenSelected(false);
              onDeselect();
            }
          }}
        />
      ) : (
        openLabel
      )}
    </button>
  );
};
