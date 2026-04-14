import type { MultipleChoiceQuestion, SingleChoiceQuestion } from "@flows/shared";
import { useQuestionContext } from "./question-context";
import { html } from "lit";
import { Input } from "../../internal-components/input";
import { createRef } from "lit/directives/ref.js";

type Props = {
  question: SingleChoiceQuestion | MultipleChoiceQuestion;
};

const DEFAULT_OTHER_LABEL = "Other";
const inputRef = createRef();

export const OtherOption = ({ question }: Props) => {
  const { value, otherSelected, refresh } = useQuestionContext();
  const type = question.type === "single-choice" ? "radio" : "checkbox";

  const handleClick = () => {
    const selected = question.type === "multiple-choice" ? !otherSelected : true;
    question.setOtherSelected(selected);
    refresh();

    // Focus the input element with a delay because it's not rendered when the button is clicked
    setTimeout(() => {
      const inputEl = inputRef.value as HTMLInputElement | null;
      inputEl?.focus();
    }, 10);
  };
  const handlePointerDown = (e: PointerEvent) => {
    // Prevent calling onBlur when clicking the button
    e.preventDefault();
  };
  const handleInputChange = (e: InputEvent) => {
    const target = e.target as HTMLInputElement;
    question.setValue(target.value);
    refresh();
  };
  const handleBlur = () => {
    if (!value) {
      question.setOtherSelected(false);
      refresh();
    }
  };

  const otherLabel = question.otherLabel || DEFAULT_OTHER_LABEL;

  return html`<div
    class="flows_basicsV2_survey_popover_choice_option flows_basicsV2_survey_popover_other_option"
    data-selected=${otherSelected ? "true" : "false"}
  >
    <button
      role=${type}
      aria-checked=${otherSelected}
      @click=${handleClick}
      @pointerdown=${handlePointerDown}
      type="button"
      class="flows_basicsV2_survey_popover_other_option_button"
    >
      <span
        class=${type === "radio"
          ? "flows_basicsV2_survey_popover_radio_indicator"
          : "flows_basicsV2_survey_popover_checkbox_indicator"}
      ></span>
    </button>
    ${otherSelected
      ? Input({
          type: "text",
          className: "flows_basicsV2_survey_popover_other_option_input",
          defaultValue: value,
          onInput: handleInputChange,
          onBlur: handleBlur,
          name: "other",
          ref: inputRef,
          placeholder: otherLabel,
        })
      : otherLabel}
  </div>`;
};
