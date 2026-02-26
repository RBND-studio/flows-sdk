import { SurveyComponentProps } from "@flows/shared";
import { FC, useCallback, useState } from "react";

type Props = SurveyComponentProps<{
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}>;

export const SurveyPopover: FC<Props> = ({ survey, position, submit, cancel }) => {
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
          defaultValue={currentQuestion.initialValue}
          onChange={(e) => currentQuestion.setValue(e.target.value)}
        />
      )}
      {currentQuestion.type === "single-choice" && (
        <>
          <div className="flows_basicsV2_survey_popover_options">
            {currentQuestion.options.map((option) => (
              <div key={option.id}>
                <label htmlFor={option.id}>{option.label}</label>
                <input type="radio" name={currentQuestion.id} value={option.id} id={option.id} />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flows_basicsV2_survey_popover_footer">
        {!isFirstQuestion && <button onClick={handlePreviousQuestion}>Previous</button>}
        {!isLastQuestion && <button onClick={handleNextQuestion}>Next</button>}
        {isLastQuestion && <button onClick={submit}>Submit</button>}
        {!isLastQuestion && <button onClick={cancel}>Cancel</button>}
      </div>
    </div>
  );
};
