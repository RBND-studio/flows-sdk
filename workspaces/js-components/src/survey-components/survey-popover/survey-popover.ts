import type {
  SurveyComponentProps,
  SurveyPopoverProps as LibrarySurveyPopoverProps,
  Survey,
  FlowsProperties,
  SurveyPopoverPosition,
} from "@flows/shared";
import { html, LitElement } from "lit";
import { property, query, state } from "lit/decorators.js";
import { Text } from "../../internal-components/text";
import clsx from "clsx";
import DOMPurify from "dompurify";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { IconButton } from "../../internal-components/icon-button";
import { Close16 } from "../../icons/close-16";
import {
  currentQuestionValue,
  getDefaultQuestionState,
  questionState,
  questionToContextValue,
} from "./question-context";
import { FreeformInput } from "./freeform-input";
import { SignalWatcher } from "@lit-labs/preact-signals";
import { SurveyNextButton } from "./survey-next-button";

export type SurveyPopoverProps = SurveyComponentProps<LibrarySurveyPopoverProps>;

const DEFAULT_POSITION: SurveyPopoverPosition = "bottom-right";
const DEFAULT_NEXT_BUTTON_LABEL = "Next";
const DEFAULT_SUBMIT_BUTTON_LABEL = "Submit";

class SurveyPopover extends SignalWatcher(LitElement) implements SurveyPopoverProps {
  @property()
  position?: SurveyPopoverPosition;

  @property({ type: Boolean })
  dismissible: boolean;

  @property({ type: Boolean })
  autoCloseAfterSubmit: boolean;

  @property({ type: Boolean })
  autoProceedAfterAnswer: boolean;

  @property()
  nextButtonLabel?: string;

  @property()
  submitButtonLabel?: string;

  @property({ type: Object })
  survey: Survey;

  @property({ type: Function })
  complete: () => void;

  @property({ type: Function })
  cancel: () => void;

  @property({ type: Object })
  __flows: FlowsProperties;

  @state()
  private accessor _questionIndex: number;
  @state()
  private accessor _isClosing = false;
  @state()
  private accessor _isExiting = false;

  @query(".flows_basicsV2_survey_popover")
  private popoverElement?: HTMLElement;

  handleTransitionEnd(event: TransitionEvent) {
    // TODO: implement
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.popoverElement?.addEventListener("transitionend", this.handleTransitionEnd.bind(this));
  }

  updated(_changedProperties: Map<string, unknown>): void {
    if (this._questionIndex === undefined) {
      this._questionIndex = this.survey.getCurrentQuestionIndex();
    }
  }

  handleUpdateQuestionContext() {
    const currentQuestion = this.survey.questions[this._questionIndex];

    if (currentQuestion && currentQuestion.id !== currentQuestionValue.peek()?.id) {
      questionState.value = questionToContextValue(currentQuestion);
    }
  }

  handleClose(callback: () => void) {
    // TODO: implement
  }

  handleNextQuestion() {
    // TODO: implement
  }

  handleNextButton() {
    const isLastQuestion = false;
    if (isLastQuestion) {
      void this.survey.submit();
      this.handleClose(this.complete);
    } else this.handleNextQuestion();
  }

  createRenderRoot(): this {
    return this;
  }

  render(): unknown {
    const currentQuestion = this.survey.questions[this._questionIndex];
    if (!currentQuestion) return null;
    this.handleUpdateQuestionContext();

    const position = this.position || DEFAULT_POSITION;
    const nextButtonLabel = this.nextButtonLabel || DEFAULT_NEXT_BUTTON_LABEL;
    const submitButtonLabel = this.submitButtonLabel || DEFAULT_SUBMIT_BUTTON_LABEL;

    const legendId = `${currentQuestion.id}-legend`;
    const descriptionId = `${currentQuestion.id}-description`;

    const questionCanAutoProceed =
      currentQuestion.type === "rating" ||
      (currentQuestion.type === "single-choice" && !currentQuestion.otherOption);
    const autoProceed = this.autoProceedAfterAnswer && questionCanAutoProceed;

    const hasOwnFooter = currentQuestion.type === "link" || currentQuestion.type === "end-screen";
    const showNextButton = !hasOwnFooter && !autoProceed;

    // TODO: fixme
    const isLastQuestion = false;

    return html`
      <div
        class="flows_basicsV2_survey_popover"
        data-position=${position}
        data-closing=${this._isClosing}
      >
        <div class="flows_basicsV2_survey_popover_content" data-exiting=${this._isExiting}>
          <fieldset>
            ${Text({
              id: legendId,
              as: "legend",
              className: clsx("flows_basicsV2_survey_popover_title", {
                flows_basicsV2_survey_popover_end_screen_title:
                  currentQuestion.type === "end-screen",
              }),
              children: unsafeHTML(
                DOMPurify.sanitize(currentQuestion.title, {
                  FORCE_BODY: true,
                  ADD_ATTR: ["target"],
                }),
              ),
              variant: "title",
            })}
            ${Text({
              id: descriptionId,
              className: clsx("flows_basicsV2_survey_popover_description", {
                flows_basicsV2_survey_popover_end_screen_description:
                  currentQuestion.type === "end-screen",
              }),
              children: unsafeHTML(
                DOMPurify.sanitize(currentQuestion.description, {
                  FORCE_BODY: true,
                  ADD_ATTR: ["target"],
                }),
              ),
              variant: "body",
            })}
            ${currentQuestion.type === "freeform" &&
            FreeformInput({ descriptionId, legendId, question: currentQuestion })}
            ${showNextButton &&
            SurveyNextButton({
              label: isLastQuestion ? submitButtonLabel : nextButtonLabel,
              question: currentQuestion,
              onClick: this.handleNextButton.bind(this),
            })}
            ${this.dismissible && currentQuestion.type !== "end-screen"
              ? IconButton({
                  "aria-label": "Close",
                  className: "flows_basicsV2_survey_popover_close",
                  onClick: () => this.handleClose(this.cancel),
                  children: Close16(),
                })
              : null}
          </fieldset>
        </div>
      </div>
    `;
  }
}

export const BasicsV2SurveyPopover = SurveyPopover;
