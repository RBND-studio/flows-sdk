import type { MultipleChoiceQuestion, SingleChoiceQuestion } from "@flows/shared";
import { useRef, type FC } from "react";
import { useQuestionContext } from "./question-context";
import { Input } from "../../internal-components/input";

type Props = {
  question: SingleChoiceQuestion | MultipleChoiceQuestion;
};

const DEFAULT_OTHER_LABEL = "Other";

export const OtherOption: FC<Props> = ({ question }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { value, otherSelected, refresh } = useQuestionContext();
  const type = question.type === "single-choice" ? "radio" : "checkbox";

  const handleClick = () => {
    const selected = question.type === "multiple-choice" ? !otherSelected : true;
    question.setOtherSelected(selected);
    refresh();

    // Focus the input element with a delay because it's not rendered when the button is clicked
    setTimeout(() => {
      const inputEl = inputRef.current;
      inputEl?.focus();
    }, 10);
  };
  const handlePointerDown = (e: React.PointerEvent) => {
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

  const otherLabel = question.otherLabel || DEFAULT_OTHER_LABEL;

  return (
    <div
      className="flows_basicsV2_survey_popover_choice_option flows_basicsV2_survey_popover_other_option"
      data-selected={otherSelected ? "true" : "false"}
    >
      <button
        role={type}
        aria-checked={otherSelected}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
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
        <Input
          ref={inputRef}
          type="text"
          className="flows_basicsV2_survey_popover_other_option_input"
          onChange={handleInputChange}
          defaultValue={value}
          onBlur={handleBlur}
          placeholder={otherLabel}
        />
      ) : (
        otherLabel
      )}
    </div>
  );
};
