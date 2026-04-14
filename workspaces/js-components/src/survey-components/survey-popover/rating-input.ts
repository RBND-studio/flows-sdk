import type { RatingDisplayType, RatingQuestion } from "@flows/shared";
import type { TemplateResult } from "lit";
import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { useQuestionContext } from "./question-context";
import { range } from "es-toolkit";
import { signal } from "@preact/signals-core";
import { StarFilled16 } from "../../icons/star-filled-16";
import { StarEmpty16 } from "../../icons/star-empty-16";
import { Text } from "../../internal-components/text";

type Props = {
  question: RatingQuestion;
  onAnswer: () => void;
  legendId: string;
  descriptionId: string;
};

const hoverIndexSignal = signal<number | null>(null);

export const RatingInput = ({
  descriptionId,
  legendId,
  onAnswer,
  question,
}: Props): TemplateResult => {
  const { value, refresh } = useQuestionContext();
  const hoverIndex = hoverIndexSignal.value;

  const handleSetValue = (value: string) => {
    question.setValue(value);
    refresh();
    onAnswer();
  };

  const options = range(question.minValue, question.maxValue + 1);
  const valueIndex = options.findIndex((optValue) => optValue.toString() === value);

  return html`<div
      class="flows_basicsV2_survey_popover_rating_list"
      role="radiogroup"
      aria-labelledby=${legendId}
      aria-describedby=${descriptionId}
    >
      ${repeat(
        options,
        (optValue) => optValue,
        (optValue, index) => {
          const isSelected = value === optValue.toString();
          return html`
            <button
              class="flows_basicsV2_survey_popover_rating_option"
              role="radio"
              type="button"
              aria-checked=${isSelected}
              aria-label="${optValue} out of ${question.maxValue}"
              @click=${() => handleSetValue(optValue.toString())}
              data-selected=${isSelected ? "true" : "false"}
              @pointerenter=${() => (hoverIndexSignal.value = index)}
              @pointerleave=${() => (hoverIndexSignal.value = null)}
            >
              ${DisplayRender({
                displayType: question.displayType,
                index: index,
                value: optValue,
                activeIndex: hoverIndex ?? valueIndex,
              })}
            </button>
          `;
        },
      )}
    </div>
    ${question.upperBoundLabel && question.lowerBoundLabel
      ? html`<div class="flows_basicsV2_survey_popover_bound_labels">
          ${Text({ variant: "body", children: question.lowerBoundLabel })}
          ${Text({ variant: "body", children: question.upperBoundLabel })}
        </div>`
      : null}`;
};

type DisplayRenderProps = {
  displayType: RatingDisplayType;
  value: number;
  index: number;
  activeIndex?: number;
};

const emojis = ["😞", "😐", "😊", "😀", "😍"];

const DisplayRender = ({
  displayType,
  index,
  value,
  activeIndex,
}: DisplayRenderProps): TemplateResult | null => {
  if (displayType === "numbers") {
    return html`<span>${value}</span>`;
  }

  if (displayType === "stars") {
    const highlight = activeIndex !== undefined && index <= activeIndex;
    return html` <span
      class="flows_basicsV2_survey_popover_rating_star"
      data-highlight=${highlight ? "true" : "false"}
      >${highlight ? StarFilled16() : StarEmpty16()}</span
    >`;
  }

  if (displayType === "emojis") {
    return html`<span>${emojis[index]}</span>`;
  }

  return null;
};
