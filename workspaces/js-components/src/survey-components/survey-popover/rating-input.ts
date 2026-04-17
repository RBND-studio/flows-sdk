import { SURVEY_EMOJIS, type RatingDisplayType, type RatingQuestion } from "@flows/shared";
import type { TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat.js";
import type { IQuestionContext } from "./question-context";
import { range } from "es-toolkit";
import { StarFilled16 } from "../../icons/star-filled-16";
import { StarEmpty16 } from "../../icons/star-empty-16";
import { Text } from "../../internal-components/text";
import { property, state } from "lit/decorators.js";

type Props = {
  question: RatingQuestion;
  onAnswer: () => void;
  legendId: string;
  descriptionId: string;
  context: IQuestionContext;
};

class RatingInput extends LitElement implements Props {
  @property({ attribute: false })
  question: RatingQuestion;

  @property({ attribute: false })
  onAnswer: () => void;

  @property({ type: String })
  legendId: string;

  @property({ type: String })
  descriptionId: string;

  @property({ attribute: false })
  context: IQuestionContext;

  @state()
  private accessor hoverIndex: number | null = null;

  createRenderRoot(): this {
    return this;
  }

  render() {
    const { value, refresh } = this.context;

    const handleSetValue = (value: string) => {
      this.question.setValue(value);
      refresh();
      this.onAnswer();
    };

    const options = range(this.question.minValue, this.question.maxValue + 1);
    const valueIndex = options.findIndex((optValue) => optValue.toString() === value);

    return html`<div
        class="flows_basicsV2_survey_popover_rating_list"
        role="radiogroup"
        aria-labelledby=${this.legendId}
        aria-describedby=${this.descriptionId}
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
                aria-label="${optValue} out of ${this.question.maxValue}"
                @click=${() => handleSetValue(optValue.toString())}
                data-selected=${isSelected ? "true" : "false"}
                @pointerenter=${() => (this.hoverIndex = index)}
                @pointerleave=${() => (this.hoverIndex = null)}
              >
                ${DisplayRender({
                  displayType: this.question.displayType,
                  index: index,
                  value: optValue,
                  activeIndex: this.hoverIndex ?? valueIndex,
                })}
              </button>
            `;
          },
        )}
      </div>
      ${this.question.upperBoundLabel && this.question.lowerBoundLabel
        ? html`<div class="flows_basicsV2_survey_popover_bound_labels">
            ${Text({ variant: "body", children: this.question.lowerBoundLabel })}
            ${Text({ variant: "body", children: this.question.upperBoundLabel })}
          </div>`
        : null}`;
  }
}
const ratingInputTagName = "flows-popover-survey-rating-input";
export const defineRatingInput = () => {
  if (!customElements.get(ratingInputTagName)) {
    customElements.define(ratingInputTagName, RatingInput);
  }
};

type DisplayRenderProps = {
  displayType: RatingDisplayType;
  value: number;
  index: number;
  activeIndex?: number;
};

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

    return html`<span
      class="flows_basicsV2_survey_popover_rating_star"
      data-highlight=${highlight ? "true" : "false"}
    >
      ${highlight ? StarFilled16() : StarEmpty16()}
    </span>`;
  }

  if (displayType === "emojis") {
    return html`<span>${SURVEY_EMOJIS[index]}</span>`;
  }

  return null;
};
