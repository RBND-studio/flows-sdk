import type { SurveyComponentProps, SurveyPopoverProps } from "@flows/shared";
import type { FC } from "react";
import { useCallback, useState } from "react";
import { Button } from "../../internal-components/button";
import { Text } from "../../internal-components/text";
import { MultipleChoiceInput } from "./multiple-choice-input";
import { RatingQuestion } from "./rating-question";
import { SingleChoiceInput } from "./single-choice-input";

type Props = SurveyComponentProps<SurveyPopoverProps>;

const SurveyPopover: FC<Props> = ({
  survey,
  position = "bottom-right",
  dismissible,
  nextButtonLabel = "Next",
  autoProceedAfterAnswer = true,
  submit,
  cancel,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);

  const questionsLength = survey.questions.length;
  const isLastQuestion = questionIndex === questionsLength - 1;

  const handleNextQuestion = useCallback(() => {
    setQuestionIndex((prev) => Math.min(prev + 1, questionsLength - 1));
  }, [questionsLength]);

  const handleAutoProceed = () => {
    if (autoProceedAfterAnswer) {
      if (!isLastQuestion) {
        // add few ms delay
        setTimeout(() => {
          handleNextQuestion();
        }, 320);
      }
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
    (currentQuestion?.type === "rating" || currentQuestion?.type === "single-choice") &&
    autoProceedAfterAnswer;

  if (!currentQuestion) return null;

  return (
    <div className="flows_basicsV2_survey_popover" data-position={position}>
      <Text className="flows_basicsV2_survey_popover_title" variant="title">
        {currentQuestion.title}
      </Text>
      <Text className="flows_basicsV2_survey_popover_description" variant="body">
        {currentQuestion.description}
      </Text>

      {currentQuestion.type === "freeform" && (
        <textarea
          className="flows_basicsV2_survey_freeform_textarea"
          defaultValue={currentQuestion.getInitialValue()}
          onChange={(e) => currentQuestion.setValue(e.target.value)}
          // FIXME: add this prop to cloud and remove the "Start typing..." default here
          placeholder={currentQuestion.placeholder ?? "Start typing..."}
          rows={4}
        />
      )}
      {currentQuestion.type === "rating" && (
        <RatingQuestion currentQuestion={currentQuestion} onAnswer={handleAutoProceed} />
      )}
      {currentQuestion.type === "single-choice" && (
        <SingleChoiceInput currentQuestion={currentQuestion} onAnswer={handleAutoProceed} />
      )}
      {currentQuestion.type === "multiple-choice" && (
        <MultipleChoiceInput currentQuestion={currentQuestion} />
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
    </div>
  );
};

export const BasicsV2SurveyPopover = SurveyPopover;
