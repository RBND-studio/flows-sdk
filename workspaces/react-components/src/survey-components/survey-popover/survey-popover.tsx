import type { SurveyComponentProps, SurveyPopoverProps } from "@flows/shared";
import type { FC } from "react";
import { useCallback, useState } from "react";
import { Button } from "../../internal-components/button";

type Props = SurveyComponentProps<SurveyPopoverProps>;

const SurveyPopover: FC<Props> = ({ survey, position = "bottom-left", submit, cancel }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const questionsLength = survey.questions.length;
  const isFirstQuestion = questionIndex === 0;
  const isLastQuestion = questionIndex === questionsLength - 1;
  const handleNextQuestion = useCallback(() => {
    setQuestionIndex((prev) => Math.min(prev + 1, questionsLength - 1));
  }, [questionsLength]);
  const handlePreviousQuestion = useCallback(() => {
    setQuestionIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const currentQuestion = survey.questions.at(questionIndex);

  if (!currentQuestion) return null;

  return (
    <div className="flows_basicsV2_survey_popover" data-position={position}>
      <p>{currentQuestion.title}</p>
      <p>{currentQuestion.description}</p>

      {currentQuestion.type === "freeform" && (
        <textarea
          className="flows_basicsV2_survey_freeform_textarea"
          defaultValue={currentQuestion.getInitialValue()}
          onChange={(e) => currentQuestion.setValue(e.target.value)}
        />
      )}
      {currentQuestion.type === "rating" && (
        <div className="flows_basicsV2_survey_rating_list">
          {Array(currentQuestion.scale)
            .fill(null)
            .map((_, i) => (
              <button
                className="flows_basicsV2_survey_rating_option"
                onClick={() => currentQuestion.setValue(i.toString())}
                key={i}
              >
                {i + 1}
              </button>
            ))}
        </div>
      )}
      {currentQuestion.type === "single-choice" && (
        <>
          <div className="flows_basicsV2_survey_option_list">
            {currentQuestion.options.map((option) => (
              <div className="flows_basicsV2_survey_option" key={option.id}>
                <input
                  defaultChecked={option.getInitialSelected()}
                  onChange={(e) => option.setSelected(e.target.checked)}
                  type="radio"
                  name={currentQuestion.id}
                  value={option.id}
                  id={option.id}
                />
                <label htmlFor={option.id}>{option.label}</label>
              </div>
            ))}
          </div>

          {currentQuestion.openOption && (
            <>
              <div className="flows_basicsV2_survey_option">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value=""
                  id={`${currentQuestion.id}-open`}
                />
                <label htmlFor={`${currentQuestion.id}-open`}>{currentQuestion.openLabel}</label>
              </div>
              <textarea
                className="flows_basicsV2_survey_freeform_textarea"
                defaultValue={currentQuestion.getInitialValue()}
                onChange={(e) => currentQuestion.setValue(e.target.value)}
              />
            </>
          )}
        </>
      )}
      {currentQuestion.type === "multiple-choice" && (
        <>
          <div className="flows_basicsV2_survey_option_list">
            {currentQuestion.options.map((option) => (
              <div className="flows_basicsV2_survey_option" key={option.id}>
                <input
                  defaultChecked={option.getInitialSelected()}
                  onChange={(e) => option.setSelected(e.target.checked)}
                  type="checkbox"
                  name={currentQuestion.id}
                  value={option.id}
                  id={option.id}
                />
                <label htmlFor={option.id}>{option.label}</label>
              </div>
            ))}
          </div>
          {currentQuestion.openOption && (
            <>
              <div className="flows_basicsV2_survey_option">
                <input
                  type="checkbox"
                  name={currentQuestion.id}
                  value=""
                  id={`${currentQuestion.id}-open`}
                />
                <label htmlFor={`${currentQuestion.id}-open`}>{currentQuestion.openLabel}</label>
              </div>
              <textarea
                className="flows_basicsV2_survey_freeform_textarea"
                defaultValue={currentQuestion.getInitialValue()}
                onChange={(e) => currentQuestion.setValue(e.target.value)}
              />
            </>
          )}
        </>
      )}
      {currentQuestion.type === "link" && (
        <>
          <Button
            href={currentQuestion.url}
            variant="primary"
            target={currentQuestion.openInNew ? "_blank" : undefined}
          >
            {currentQuestion.linkLabel}
          </Button>
        </>
      )}

      <div className="flows_basicsV2_survey_popover_footer">
        {!isFirstQuestion && (
          <Button variant="secondary" onClick={handlePreviousQuestion}>
            Previous
          </Button>
        )}
        {!isLastQuestion && (
          <Button variant="secondary" onClick={handleNextQuestion}>
            Next
          </Button>
        )}
        {isLastQuestion && (
          <Button variant="secondary" onClick={submit}>
            Submit
          </Button>
        )}
        {!isLastQuestion && (
          <Button variant="secondary" onClick={cancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export const BasicsV2SurveyPopover = SurveyPopover;
