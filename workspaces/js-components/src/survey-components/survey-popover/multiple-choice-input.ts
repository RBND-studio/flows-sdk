import type { MultipleChoiceQuestion } from "@flows/shared";
import { useQuestionContext } from "./question-context";
import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { OtherOption } from "./other-option";

type Props = {
  question: MultipleChoiceQuestion;
  legendId: string;
  descriptionId: string;
};

export const MultipleChoiceInput = ({ descriptionId, legendId, question }: Props) => {
  const { optionIds, refresh } = useQuestionContext();

  return html`<div
    class="flows_basicsV2_survey_popover_option_list"
    aria-labelledby=${legendId}
    aria-describedby=${descriptionId}
  >
    ${repeat(
      question.options,
      (option) => option.id,
      (option) => {
        const isSelected = optionIds.includes(option.id);
        const handleClick = () => {
          const updatedOptionIds = isSelected
            ? optionIds.filter((id) => id !== option.id)
            : [...optionIds, option.id];
          question.setSelectedOptionIds(updatedOptionIds);
          refresh();
        };

        return html`
          <button
            role="checkbox"
            type="button"
            aria-checked=${isSelected}
            class="flows_basicsV2_survey_popover_choice_option"
            data-selected=${isSelected ? "true" : "false"}
            @click=${handleClick}
          >
            <span class="flows_basicsV2_survey_popover_checkbox_indicator"></span>
            ${option.label}
          </button>
        `;
      },
    )}
    ${question.otherOption ? OtherOption({ question }) : null}
  </div>`;
};
