import type { SurveyComponentProps, SurveyPopoverProps } from "@flows/shared";
import clsx from "clsx";
import type { FC } from "react";
import { Close16 } from "../../icons/close16";
import { Button } from "../../internal-components/button";
import { IconButton } from "../../internal-components/icon-button";
import { Text } from "../../internal-components/text";
import { EndScreen } from "./end-screen";
import { MultipleChoiceInput } from "./multiple-choice-input";
import { RatingQuestion } from "./rating-question";
import { SingleChoiceInput } from "./single-choice-input";
import { useSurveyPopover } from "./use-survey-popover";

type Props = SurveyComponentProps<SurveyPopoverProps>;

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
  } = useSurveyPopover({ questionsLength: survey.questions.length, autoProceedAfterAnswer });

  const currentQuestion = survey.questions.at(questionIndex);

  if (!currentQuestion) return null;

  const legendId = `${currentQuestion.id}-legend`;
  const descriptionId = `${currentQuestion.id}-description`;

  const questionAutoProceeds =
    currentQuestion.type === "rating" ||
    (currentQuestion.type === "single-choice" && !currentQuestion.otherOption);

  const hideNextButton = autoProceedAfterAnswer && questionAutoProceeds;

  const hasOwnFooter = currentQuestion.type === "link" || currentQuestion.type === "end-screen";
  const showFooter = !hasOwnFooter && (isLastQuestion || !hideNextButton);

  const isEndScreen = currentQuestion.type === "end-screen";

  const handleLinkClick = () => {
    if (isLastQuestion) submit();
    else handleNextQuestion();
  };

  return (
    <div
      ref={popoverRef}
      className="flows_basicsV2_survey_popover"
      data-position={position ? position : DEFAULT_POSITION}
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
              flows_basicsV2_survey_popover_end_screen_title: isEndScreen,
            })}
            variant="title"
          >
            {currentQuestion.title}
          </Text>
          <Text
            id={descriptionId}
            className={clsx("flows_basicsV2_survey_popover_description", {
              flows_basicsV2_survey_popover_end_screen_description: isEndScreen,
            })}
            variant="body"
          >
            {currentQuestion.description}
          </Text>

          {currentQuestion.type === "freeform" && (
            <textarea
              className="flows_basicsV2_survey_popover_freeform_textarea"
              aria-labelledby={legendId}
              aria-describedby={descriptionId}
              id={`${currentQuestion.id}-textarea`}
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
              onAnswer={() => handleAutoProceed({ currentQuestion })}
              legendId={legendId}
              descriptionId={descriptionId}
            />
          )}
          {currentQuestion.type === "single-choice" && (
            <SingleChoiceInput
              currentQuestion={currentQuestion}
              onAnswer={() => handleAutoProceed({ currentQuestion })}
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
          )}
          {currentQuestion.type === "end-screen" && (
            <EndScreen
              currentQuestion={currentQuestion}
              handleLinkClick={handleLinkClick}
              submit={() => handleClose(submit)}
              autoCloseAfterSubmit={autoCloseAfterSubmit}
            />
          )}

          {showFooter && (
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
                <Button
                  className="flows_basicsV2_survey_popover_submit"
                  variant="primary"
                  onClick={() => handleClose(submit)}
                >
                  Submit
                </Button>
              )}
            </div>
          )}

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
