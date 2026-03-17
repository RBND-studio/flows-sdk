import type { SurveyComponentProps, SurveyPopoverProps } from "@flows/shared";
import clsx from "clsx";
import type { FC } from "react";
import { Close16 } from "../../icons/close16";
import { Button } from "../../internal-components/button";
import { IconButton } from "../../internal-components/icon-button";
import { Text } from "../../internal-components/text";
import { EndScreen } from "./end-screen";
import { MultipleChoiceInput } from "./multiple-choice-input";
import { RatingInput } from "./rating-input";
import { SingleChoiceInput } from "./single-choice-input";
import { useSurveyPopover } from "./use-survey-popover";
import { FreeformInput } from "./freeform-input";
import { QuestionProvider } from "./question-context";
import { SurveyNextButton } from "./survey-next-button";

type Props = SurveyComponentProps<SurveyPopoverProps>;

const DEFAULT_POSITION: SurveyPopoverProps["position"] = "bottom-right";
const DEFAULT_NEXT_BUTTON_LABEL = "Next";
const DEFAULT_SUBMIT_BUTTON_LABEL = "Submit";

const SurveyPopover: FC<Props> = (props) => {
  const {
    survey,
    dismissible,
    autoProceedAfterAnswer,
    autoCloseAfterSubmit = true,
    complete,
    cancel,
  } = props;

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

  const position = props.position || DEFAULT_POSITION;
  const nextButtonLabel = props.nextButtonLabel || DEFAULT_NEXT_BUTTON_LABEL;
  const submitButtonLabel = props.submitButtonLabel || DEFAULT_SUBMIT_BUTTON_LABEL;

  const legendId = `${currentQuestion.id}-legend`;
  const descriptionId = `${currentQuestion.id}-description`;

  const questionCanAutoProceed =
    currentQuestion.type === "rating" ||
    (currentQuestion.type === "single-choice" && !currentQuestion.otherOption);
  const autoProceed = autoProceedAfterAnswer && questionCanAutoProceed;

  const hasOwnFooter = currentQuestion.type === "link" || currentQuestion.type === "end-screen";
  const showNextButton = !hasOwnFooter && !autoProceed;

  const handleLinkClick = () => {
    if (isLastQuestion) complete();
    else handleNextQuestion();
  };
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
      <div
        key={questionIndex}
        className="flows_basicsV2_survey_popover_content"
        data-exiting={isExiting || undefined}
      >
        <fieldset>
          <Text
            as="legend"
            id={legendId}
            className={clsx("flows_basicsV2_survey_popover_title", {
              flows_basicsV2_survey_popover_end_screen_title: currentQuestion.type === "end-screen",
            })}
            variant="title"
          >
            {currentQuestion.title}
          </Text>
          <Text
            id={descriptionId}
            className={clsx("flows_basicsV2_survey_popover_description", {
              flows_basicsV2_survey_popover_end_screen_description:
                currentQuestion.type === "end-screen",
            })}
            variant="body"
          >
            {currentQuestion.description}
          </Text>

          <QuestionProvider question={currentQuestion}>
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
                href={currentQuestion.url ? currentQuestion.url : undefined}
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
            )}
            {currentQuestion.type === "end-screen" && (
              <EndScreen
                question={currentQuestion}
                handleLinkClick={handleLinkClick}
                submit={() => handleClose(complete)}
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

          {dismissible && !isLastQuestion && (
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
