import {
  type SurveyComponentProps,
  type SurveyPopoverProps as LibrarySurveyPopoverProps,
  SURVEY_POPOVER_DEFAULT_POSITION,
  SURVEY_POPOVER_DEFAULT_NEXT_BUTTON_LABEL,
  SURVEY_POPOVER_DEFAULT_SUBMIT_BUTTON_LABEL,
} from "@flows/shared";
import clsx from "clsx";
import DOMPurify from "dompurify";
import type { FC } from "react";
import { Close16 } from "../../icons/close16";
import { Button } from "../../internal-components/button";
import { IconButton } from "../../internal-components/icon-button";
import { Text } from "../../internal-components/text";
import { EndScreen } from "./end-screen";
import { FreeformInput } from "./freeform-input";
import { MultipleChoiceInput } from "./multiple-choice-input";
import { QuestionProvider } from "./question-context";
import { RatingInput } from "./rating-input";
import { SingleChoiceInput } from "./single-choice-input";
import { SurveyNextButton } from "./survey-next-button";
import { useSurveyPopover } from "./use-survey-popover";

export type SurveyPopoverProps = SurveyComponentProps<LibrarySurveyPopoverProps>;

const SurveyPopover: FC<SurveyPopoverProps> = (props) => {
  const { survey, dismissible, autoProceedAfterAnswer, autoCloseAfterSubmit, complete, cancel } =
    props;

  const {
    popoverRef,
    questionIndex,
    isExiting,
    isClosing,
    isLastQuestion,
    handleClose,
    handleNextQuestion,
    handleAutoProceed,
    handleHeightTransitionEnd,
  } = useSurveyPopover({ autoProceedAfterAnswer, survey });

  const currentQuestion = survey.questions.at(questionIndex);
  if (!currentQuestion) return null;

  const position = props.position || SURVEY_POPOVER_DEFAULT_POSITION;
  const nextButtonLabel = props.nextButtonLabel || SURVEY_POPOVER_DEFAULT_NEXT_BUTTON_LABEL;
  const submitButtonLabel = props.submitButtonLabel || SURVEY_POPOVER_DEFAULT_SUBMIT_BUTTON_LABEL;

  const legendId = `${currentQuestion.id}-legend`;
  const descriptionId = `${currentQuestion.id}-description`;

  const questionCanAutoProceed =
    currentQuestion.type === "rating" ||
    (currentQuestion.type === "single-choice" && !currentQuestion.otherOption);
  const autoProceed = autoProceedAfterAnswer && questionCanAutoProceed;

  const hasOwnFooter = currentQuestion.type === "link" || currentQuestion.type === "end-screen";
  const showNextButton = !hasOwnFooter && !autoProceed;

  const handleNextButton = () => {
    if (isLastQuestion) {
      void survey.submit();
      handleClose(complete);
    } else handleNextQuestion();
  };

  return (
    <div
      ref={popoverRef}
      className="flows_basicsV2_survey_popover"
      data-position={position}
      data-closing={isClosing || undefined}
      onTransitionEnd={handleHeightTransitionEnd}
    >
      <div className="flows_basicsV2_survey_popover_content" data-exiting={isExiting || undefined}>
        <fieldset className="flows_basicsV2_survey_popover_fieldset">
          <Text
            as="legend"
            id={legendId}
            className={clsx("flows_basicsV2_survey_popover_title", {
              flows_basicsV2_survey_popover_end_screen_title: currentQuestion.type === "end-screen",
            })}
            variant="title"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(currentQuestion.title, {
                FORCE_BODY: true,
                ADD_ATTR: ["target"],
              }),
            }}
          />
          <Text
            id={descriptionId}
            className={clsx("flows_basicsV2_survey_popover_description", {
              flows_basicsV2_survey_popover_end_screen_description:
                currentQuestion.type === "end-screen",
            })}
            variant="body"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(currentQuestion.description, {
                FORCE_BODY: true,
                ADD_ATTR: ["target"],
              }),
            }}
          />

          <QuestionProvider
            question={currentQuestion}
            // Key to reset the context state value when switching to a different question
            key={currentQuestion.id}
          >
            {currentQuestion.type === "freeform" && (
              <FreeformInput
                question={currentQuestion}
                descriptionId={descriptionId}
                legendId={legendId}
              />
            )}
            {currentQuestion.type === "rating" && (
              <RatingInput
                question={currentQuestion}
                onAnswer={() => handleAutoProceed({ currentQuestion })}
                legendId={legendId}
                descriptionId={descriptionId}
              />
            )}
            {currentQuestion.type === "single-choice" && (
              <SingleChoiceInput
                question={currentQuestion}
                onAnswer={() => handleAutoProceed({ currentQuestion })}
                legendId={legendId}
                descriptionId={descriptionId}
              />
            )}
            {currentQuestion.type === "multiple-choice" && (
              <MultipleChoiceInput
                question={currentQuestion}
                legendId={legendId}
                descriptionId={descriptionId}
              />
            )}
            {currentQuestion.type === "link" && (
              <Button
                href={currentQuestion.url || undefined}
                variant="primary"
                target={currentQuestion.openInNew ? "_blank" : undefined}
                className="flows_basicsV2_survey_popover_link_button"
                onClick={() => {
                  currentQuestion.setClicked();
                  handleNextButton();
                }}
              >
                {currentQuestion.linkLabel}
              </Button>
            )}
            {currentQuestion.type === "end-screen" && (
              <EndScreen
                question={currentQuestion}
                handleClose={() => handleClose(complete)}
                autoCloseAfterSubmit={autoCloseAfterSubmit}
              />
            )}

            {showNextButton && (
              <SurveyNextButton
                question={currentQuestion}
                label={isLastQuestion ? submitButtonLabel : nextButtonLabel}
                onClick={handleNextButton}
              />
            )}
          </QuestionProvider>

          {dismissible && currentQuestion.type !== "end-screen" && (
            <IconButton
              aria-label="Close"
              className="flows_basicsV2_survey_popover_close"
              onClick={() => handleClose(cancel)}
            >
              <Close16 />
            </IconButton>
          )}
        </fieldset>
      </div>
    </div>
  );
};

export const BasicsV2SurveyPopover = SurveyPopover;
