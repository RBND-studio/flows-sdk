import type { MultipleChoiceQuestion, SingleChoiceQuestion } from "@flows/shared/src/types/survey";
import type { FC } from "react";

export const OpenOption: FC<{
  currentQuestion: SingleChoiceQuestion | MultipleChoiceQuestion;
  openSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}> = ({ currentQuestion, openSelected, onSelect, onDeselect }) => {
  const { openLabel } = currentQuestion;

  const handleClick = () => {
    if (!openSelected) {
      currentQuestion.setOpenSelected(true);
      currentQuestion.setValue("");
      onSelect();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flows_basicsV2_survey_popover_open_option"
      data-selected={openSelected ? "true" : "false"}
    >
      {openSelected ? (
        <input
          ref={(el) => el?.focus()}
          type="text"
          className="flows_basicsV2_survey_open_option_input"
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
