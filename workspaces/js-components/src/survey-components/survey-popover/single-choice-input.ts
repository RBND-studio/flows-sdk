import type { SingleChoiceQuestion } from "@flows/shared";
import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { useQuestionContext } from "./question-context";
import { OtherOption } from "./other-option";

type Props = {
  question: SingleChoiceQuestion;
  onAnswer: () => void;
  legendId: string;
  descriptionId: string;
};

export const SingleChoiceInput = ({ question, onAnswer, legendId, descriptionId }: Props) => {
  const { optionIds, refresh } = useQuestionContext();

  const handleClick = (optionId: string) => {
    question.setSelectedOptionIds([optionId]);
    refresh();
    onAnswer();
  };

  return html` <div
    class="flows_basicsV2_survey_popover_option_list"
    role="radiogroup"
    aria-labelledby=${legendId}
    aria-describedby=${descriptionId}
  >
    ${repeat(
      question.options,
      (option) => option.id,
      (option) => {
        const isSelected = optionIds.includes(option.id);
        return html`<button
          class="flows_basicsV2_survey_popover_choice_option"
          role="radio"
          type="button"
          aria-checked=${isSelected}
          data-selected=${isSelected ? "true" : "false"}
          @click=${() => handleClick(option.id)}
        >
          <span class="flows_basicsV2_survey_popover_radio_indicator"></span>
          ${option.label}
        </button>`;
      },
    )}
    ${question.otherOption ? OtherOption({ question }) : null}
  </div>`;
};
