import type { SurveyComponentProps, SurveyPopoverProps } from "@flows/shared";
import type { FC } from "react";
import { useCallback, useRef, useState } from "react";
import { Button } from "../../internal-components/button";
import { Text } from "../../internal-components/text";
import { MultipleChoiceInput } from "./multiple-choice-input";
import { RatingQuestion } from "./rating-question";
import { SingleChoiceInput } from "./single-choice-input";
import { IconButton } from "../../internal-components/icon-button";
import { Close16 } from "../../icons/close16";
import { EndScreen } from "./end-screen";

type Props = SurveyComponentProps<SurveyPopoverProps>;

// The duration should be in sync with the animation durations in survey-popover.css
const TRANSITION_DURATION = 240;
const CLOSE_ANIMATION_DURATION = 160;
const DEFAULT_POSITION: SurveyPopoverProps["position"] = "bottom-right";
const DEFAULT_NEXT_BUTTON_LABEL = "Next";

const SurveyPopover: FC<Props> = ({
  survey,
  position,
  dismissible,
  nextButtonLabel,
  autoProceedAfterAnswer,
  autoCloseAfterSubmit = true,
  submit,
  cancel,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const closeTimeoutRef = useRef<number>(null);
  const handleClose = useCallback((fn: () => void) => {
    clearTimeout(closeTimeoutRef.current ?? undefined);
    setIsClosing(true);
    closeTimeoutRef.current = window.setTimeout(fn, CLOSE_ANIMATION_DURATION);
  }, []);

  const questionsLength = survey.questions.length;
  const isLastQuestion = questionIndex === questionsLength - 1;

  const navigateTo = useCallback((nextIndex: number) => {
    const popover = popoverRef.current;
    const frozenHeight = popover?.offsetHeight ?? 0;
    if (popover) {
      popover.style.height = `${frozenHeight}px`;
    }
    setIsExiting(true);
    setTimeout(() => {
      setQuestionIndex(nextIndex);
      setIsExiting(false);
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
    }, TRANSITION_DURATION);
  }, []);

  const handleNextQuestion = useCallback(() => {
    navigateTo(Math.min(questionIndex + 1, questionsLength - 1));
  }, [questionIndex, questionsLength, navigateTo]);

  const autoProceedTimeoutRef = useRef<number>(null);
  const handleAutoProceed = () => {
    if (autoProceedAfterAnswer && !isLastQuestion) {
      clearTimeout(autoProceedTimeoutRef.current ?? undefined);
      autoProceedTimeoutRef.current = window.setTimeout(handleNextQuestion, 320);
    }
  };

  const handleHeightTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === "height" && e.target === popoverRef.current) {
      popoverRef.current.style.height = "";
    }
  };

  const currentQuestion = survey.questions.at(questionIndex);

  const handleLinkClick = () => {
    if (isLastQuestion) {
      submit();
    } else {
      handleNextQuestion();
    }
  };

  const hideNextButton =
    (currentQuestion?.type === "rating" ||
      (currentQuestion?.type === "single-choice" && !currentQuestion.openOption)) &&
    autoProceedAfterAnswer;

  if (!currentQuestion) return null;

  const legendId = currentQuestion.id + "-legend";
  const descriptionId = currentQuestion.id + "-description";

  return (
    <div
      ref={popoverRef}
      className="flows_basicsV2_survey_popover"
      data-position={position ? position : DEFAULT_POSITION}
      data-closing={isClosing ? "true" : undefined}
      onTransitionEnd={handleHeightTransitionEnd}
    >
      <div
        key={questionIndex}
        className="flows_basicsV2_survey_popover_content"
        data-exiting={isExiting ? "true" : undefined}
      >
        <fieldset>
          <Text
            as="legend"
            id={legendId}
            className={
              `flows_basicsV2_survey_popover_title` +
              (currentQuestion.type === "end-screen"
                ? " flows_basicsV2_survey_popover_end_screen_title"
                : "")
            }
            variant="title"
          >
            {currentQuestion.title}
          </Text>
          <Text
            className={
              `flows_basicsV2_survey_popover_description` +
              (currentQuestion.type === "end-screen"
                ? " flows_basicsV2_survey_popover_end_screen_description"
                : "")
            }
            variant="body"
            id={descriptionId}
          >
            {currentQuestion.description}
          </Text>

          {currentQuestion.type === "freeform" && (
            <textarea
              className="flows_basicsV2_survey_popover_freeform_textarea"
              aria-labelledby={legendId}
              aria-describedby={descriptionId}
              id={currentQuestion.id + "-textarea"}
              defaultValue={currentQuestion.getInitialValue()}
              onChange={(e) => currentQuestion.setValue(e.target.value)}
              placeholder={
                currentQuestion.placeholder ? currentQuestion.placeholder : "Start typing..."
              }
              rows={4}
            />
          )}
          {currentQuestion.type === "rating" && (
            <RatingQuestion
              currentQuestion={currentQuestion}
              onAnswer={handleAutoProceed}
              legendId={legendId}
              descriptionId={descriptionId}
            />
          )}
          {currentQuestion.type === "single-choice" && (
            <SingleChoiceInput
              currentQuestion={currentQuestion}
              onAnswer={handleAutoProceed}
              legendId={legendId}
              descriptionId={descriptionId}
            />
          )}
          {currentQuestion.type === "multiple-choice" && (
            <MultipleChoiceInput
              currentQuestion={currentQuestion}
              legendId={legendId}
              descriptionId={descriptionId}
            />
          )}
          {currentQuestion.type === "link" && (
            <>
              <Button
                href={currentQuestion.url ? currentQuestion.url : undefined}
                variant="primary"
                target={currentQuestion.openInNew ? "_blank" : undefined}
                className="flows_basicsV2_survey_popover_link_button"
                onClick={() => {
                  if (currentQuestion.type === "link") currentQuestion.setClicked();
                  handleLinkClick();
                }}
              >
                {currentQuestion.linkLabel}
              </Button>
            </>
          )}
          {currentQuestion.type === "end-screen" && (
            <EndScreen
              currentQuestion={currentQuestion}
              handleLinkClick={handleLinkClick}
              submit={() => handleClose(submit)}
              autoCloseAfterSubmit={autoCloseAfterSubmit}
            />
          )}

          {currentQuestion.type !== "link" &&
            currentQuestion.type !== "end-screen" &&
            (isLastQuestion || !hideNextButton) && (
              <div className="flows_basicsV2_survey_popover_footer">
                {!isLastQuestion && !hideNextButton && (
                  <Button
                    className="flows_basicsV2_survey_popover_submit"
                    variant="primary"
                    // FIXME: @VojtechVidra add disabled state when required question is unanswered
                    // disabled
                    onClick={handleNextQuestion}
                  >
                    {nextButtonLabel ? nextButtonLabel : DEFAULT_NEXT_BUTTON_LABEL}
                  </Button>
                )}
                {isLastQuestion && (
                  <Button variant="secondary" onClick={() => handleClose(submit)}>
                    Submit
                  </Button>
                )}
              </div>
            )}

          {dismissible && !isLastQuestion ? (
            <IconButton
              aria-label="Close"
              className="flows_basicsV2_survey_popover_close"
              onClick={() => handleClose(cancel)}
            >
              <Close16 />
            </IconButton>
          ) : null}
        </fieldset>
      </div>
    </div>
  );
};

export const BasicsV2SurveyPopover = SurveyPopover;
