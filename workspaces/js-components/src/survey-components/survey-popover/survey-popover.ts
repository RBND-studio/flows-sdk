import {
  type SurveyComponentProps,
  type SurveyPopoverProps as LibrarySurveyPopoverProps,
  type Survey,
  type FlowsProperties,
  type SurveyPopoverPosition,
  type SurveyQuestion,
  SURVEY_POPOVER_CLOSE_ANIMATION_DURATION,
  SURVEY_POPOVER_TRANSITION_DURATION,
  SURVEY_POPOVER_AUTO_PROCEED_DURATION,
  SURVEY_POPOVER_DEFAULT_POSITION,
  SURVEY_POPOVER_DEFAULT_NEXT_BUTTON_LABEL,
  SURVEY_POPOVER_DEFAULT_SUBMIT_BUTTON_LABEL,
  SURVEY_POPOVER_AUTO_CLOSE_TIMEOUT,
} from "@flows/shared";
import { html, LitElement } from "lit";
import { property, query, state } from "lit/decorators.js";
import { Text } from "../../internal-components/text";
import clsx from "clsx";
import DOMPurify from "dompurify";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { IconButton } from "../../internal-components/icon-button";
import { Close16 } from "../../icons/close-16";
import { currentQuestionValue, questionState, questionToContextValue } from "./question-context";
import { FreeformInput } from "./freeform-input";
import { SignalWatcher } from "@lit-labs/preact-signals";
import { SurveyNextButton } from "./survey-next-button";
import { RatingInput } from "./rating-input";
import { SingleChoiceInput } from "./single-choice-input";
import { MultipleChoiceInput } from "./multiple-choice-input";
import { Button } from "../../internal-components/button";
import { EndScreen } from "./end-screen";

export type SurveyPopoverProps = SurveyComponentProps<LibrarySurveyPopoverProps>;

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

  autoCloseTimeout: number;
  autoProceedTimeout: number;
  closeTimeout: number;

  @query(".flows_basicsV2_survey_popover")
  private popoverElement?: HTMLElement;

  handleTransitionEnd(event: TransitionEvent) {
    if (event.propertyName === "height" && event.target === this.popoverElement) {
      this.popoverElement.style.height = "";
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    this._questionIndex = this.survey.getCurrentQuestionIndex();
    this.popoverElement?.addEventListener("transitionend", this.handleTransitionEnd.bind(this));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    clearTimeout(this.autoCloseTimeout);
    clearTimeout(this.autoProceedTimeout);
    clearTimeout(this.closeTimeout);
  }

  get currentQuestion(): SurveyQuestion | undefined {
    return this.survey.questions.at(this._questionIndex);
  }
  get isLastQuestion(): boolean {
    return this._questionIndex === this.survey.questions.length - 1;
  }

  updated(_changedProperties: Map<string, unknown>): void {
    if (this.currentQuestion?.type === "end-screen" && this.autoCloseAfterSubmit) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = setTimeout(() => {
        this.handleClose(this.complete);
      }, SURVEY_POPOVER_AUTO_CLOSE_TIMEOUT);
    }
  }

  handleUpdateQuestionContext() {
    const currentQuestion = this.survey.questions[this._questionIndex];

    if (currentQuestion && currentQuestion.id !== currentQuestionValue.peek()?.id) {
      questionState.value = questionToContextValue(currentQuestion);
    }
  }

  handleClose(callback: () => void) {
    clearTimeout(this.closeTimeout);
    this._isClosing = true;
    this.closeTimeout = setTimeout(callback, SURVEY_POPOVER_CLOSE_ANIMATION_DURATION);
  }

  navigateTo(nextIndex: number) {
    const popover = this.popoverElement;
    const frozenHeight = popover?.offsetHeight ?? 0;
    if (popover) {
      popover.style.height = `${frozenHeight}px`;
    }
    this._isExiting = true;
    setTimeout(() => {
      this._questionIndex = nextIndex;
      this._isExiting = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (popover) {
            // Temporarily lift the constraint to measure the new natural height,
            // then restore before animating so the transition has a valid start point.
            popover.style.height = "auto";
            const naturalHeight = popover.scrollHeight;
            popover.style.height = `${frozenHeight}px`;
            popover.getBoundingClientRect(); // force reflow
            popover.style.height = `${naturalHeight}px`;
          }
        });
      });
    }, SURVEY_POPOVER_TRANSITION_DURATION);
  }

  handleNextQuestion() {
    this.navigateTo(this.survey.nextQuestion());
  }

  handleNextButton() {
    if (this.isLastQuestion) {
      void this.survey.submit();
      this.handleClose(this.complete);
    } else this.handleNextQuestion();
  }

  handleAutoProceed() {
    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return;

    const hasOtherOption =
      currentQuestion.type === "single-choice" && !!currentQuestion.otherOption;

    if (this.autoProceedAfterAnswer && !this.isLastQuestion && !hasOtherOption) {
      clearTimeout(this.autoProceedTimeout);
      this.autoProceedTimeout = setTimeout(() => {
        this.handleNextQuestion();
      }, SURVEY_POPOVER_AUTO_PROCEED_DURATION);
    }
  }

  createRenderRoot(): this {
    return this;
  }

  render(): unknown {
    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return null;
    this.handleUpdateQuestionContext();

    const position = this.position || SURVEY_POPOVER_DEFAULT_POSITION;
    const nextButtonLabel = this.nextButtonLabel || SURVEY_POPOVER_DEFAULT_NEXT_BUTTON_LABEL;
    const submitButtonLabel = this.submitButtonLabel || SURVEY_POPOVER_DEFAULT_SUBMIT_BUTTON_LABEL;

    const legendId = `${currentQuestion.id}-legend`;
    const descriptionId = `${currentQuestion.id}-description`;

    const questionCanAutoProceed =
      currentQuestion.type === "rating" ||
      (currentQuestion.type === "single-choice" && !currentQuestion.otherOption);
    const autoProceed = this.autoProceedAfterAnswer && questionCanAutoProceed;

    const hasOwnFooter = currentQuestion.type === "link" || currentQuestion.type === "end-screen";
    const showNextButton = !hasOwnFooter && !autoProceed;

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
            ${currentQuestion.type === "freeform"
              ? FreeformInput({ descriptionId, legendId, question: currentQuestion })
              : null}
            ${currentQuestion.type === "rating"
              ? RatingInput({
                  question: currentQuestion,
                  descriptionId,
                  legendId,
                  onAnswer: this.handleAutoProceed.bind(this),
                })
              : null}
            ${currentQuestion.type === "single-choice"
              ? SingleChoiceInput({
                  question: currentQuestion,
                  descriptionId,
                  legendId,
                  onAnswer: this.handleAutoProceed.bind(this),
                })
              : null}
            ${currentQuestion.type === "multiple-choice"
              ? MultipleChoiceInput({ descriptionId, legendId, question: currentQuestion })
              : null}
            ${currentQuestion.type === "link"
              ? Button({
                  href: currentQuestion.url || undefined,
                  variant: "primary",
                  target: currentQuestion.openInNew ? "_blank" : undefined,
                  className: "flows_basicsV2_survey_popover_link_button",
                  onClick: () => {
                    currentQuestion.setClicked();
                    this.handleNextButton();
                  },
                  children: currentQuestion.linkLabel,
                })
              : null}
            ${currentQuestion.type === "end-screen"
              ? EndScreen({
                  handleClose: () => this.handleClose(this.complete),
                  question: currentQuestion,
                  autoCloseAfterSubmit: this.autoCloseAfterSubmit,
                })
              : null}
            ${showNextButton
              ? SurveyNextButton({
                  label: this.isLastQuestion ? submitButtonLabel : nextButtonLabel,
                  question: currentQuestion,
                  onClick: this.handleNextButton.bind(this),
                })
              : null}
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
