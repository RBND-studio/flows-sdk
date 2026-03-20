import type { MultipleChoiceQuestion, SingleChoiceQuestion } from "@flows/shared";
import type { FC } from "react";
import { useQuestionContext } from "./question-context";

type Props = {
  question: SingleChoiceQuestion | MultipleChoiceQuestion;
  type: "radio" | "checkbox";
};

const DEFAULT_OTHER_LABEL = "Other";

export const OtherOption: FC<Props> = ({ question, type }) => {
  const { value, otherSelected, refresh } = useQuestionContext();

  const handleClick = () => {
    const selected = question.type === "multiple-choice" ? !otherSelected : true;
    question.setOtherSelected(selected);
    refresh();
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent calling onBlur when clicking the button
    e.preventDefault();
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    question.setValue(e.target.value);
    refresh();
  };
  const handleBlur = () => {
    if (!value) {
      question.setOtherSelected(false);
      refresh();
    }
  };

  return (
    <div
      className="flows_basicsV2_survey_popover_choice_option flows_basicsV2_survey_popover_other_option"
      data-selected={otherSelected ? "true" : "false"}
    >
      <button
        role={type === "radio" ? "radio" : "checkbox"}
        aria-checked={otherSelected}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        type="button"
        className="flows_basicsV2_survey_popover_other_option_button"
      >
        <span
          className={
            type === "radio"
              ? "flows_basicsV2_survey_popover_radio_indicator"
              : "flows_basicsV2_survey_popover_checkbox_indicator"
          }
        />
      </button>
      {otherSelected ? (
        <input
          // oxlint-disable-next-line jsx_a11y/no-autofocus -- We want to autofocus the input when the user selects the "Other" option
          autoFocus
          type="text"
          className="flows_basicsV2_survey_popover_other_option_input"
          onChange={handleInputChange}
          defaultValue={value}
          onBlur={handleBlur}
        />
      ) : (
        question.otherLabel || DEFAULT_OTHER_LABEL
      )}
    </div>
  );
};
