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

type Props = SurveyComponentProps<SurveyPopoverProps>;

// The duration should be in sync with the animation durations in survey-popover.css
const TRANSITION_DURATION = 240;

const SurveyPopover: FC<Props> = ({
  survey,
  position = "bottom-right",
  dismissible,
  nextButtonLabel = "Next",
  autoProceedAfterAnswer = false,
  submit,
  cancel,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const handleAutoProceed = () => {
    if (autoProceedAfterAnswer && !isLastQuestion) {
      setTimeout(handleNextQuestion, 320);
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
      data-position={position}
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
            className="flows_basicsV2_survey_popover_title"
            variant="title"
          >
            {currentQuestion.title}
          </Text>
          <Text
            className="flows_basicsV2_survey_popover_description"
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
              // FIXME: add this prop to cloud and remove the "Start typing..." default here
              placeholder={currentQuestion.placeholder ?? "Start typing..."}
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
                href={currentQuestion.url}
                variant="primary"
                target={currentQuestion.openInNew ? "_blank" : undefined}
                className="flows_basicsV2_survey_popover_link_button"
                onClick={() => {
                  currentQuestion.setClicked();
                  handleLinkClick();
                }}
              >
                {currentQuestion.linkLabel}
              </Button>
            </>
          )}

          {currentQuestion.type !== "link" && (isLastQuestion || !hideNextButton) && (
            <div className="flows_basicsV2_survey_popover_footer">
              {!isLastQuestion && !hideNextButton && (
                <Button
                  className="flows_basicsV2_survey_popover_submit"
                  variant="primary"
                  // FIXME: @VojtechVidra add disabled state when required question is unanswered
                  // disabled
                  onClick={handleNextQuestion}
                >
                  {nextButtonLabel}
                </Button>
              )}
              {isLastQuestion && (
                <Button variant="secondary" onClick={submit}>
                  Submit
                </Button>
              )}
            </div>
          )}

          {dismissible ? (
            <IconButton
              aria-label="Close"
              className="flows_basicsV2_survey_popover_close"
              onClick={cancel}
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
