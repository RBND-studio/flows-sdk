import type { SingleChoiceQuestion } from "@flows/shared";
import { OtherOption } from "./other-option";
import { useQuestionContext } from "./question-context";

type Props = {
  question: SingleChoiceQuestion;
  onAnswer: () => void;
  legendId: string;
  descriptionId: string;
};

export const SingleChoiceInput = ({ question, onAnswer, legendId, descriptionId }: Props) => {
  const { optionIds, refresh } = useQuestionContext();

  return (
    <div
      className="flows_basicsV2_survey_popover_option_list"
      role="radiogroup"
      aria-labelledby={legendId}
      aria-describedby={descriptionId}
    >
      {question.options.map((option) => {
        const isSelected = optionIds.includes(option.id);
        return (
          <button
            key={option.id}
            role="radio"
            type="button"
            aria-checked={isSelected}
            className="flows_basicsV2_survey_popover_choice_option"
            data-selected={isSelected ? "true" : "false"}
            onClick={() => {
              question.setSelectedOptionIds([option.id]);
              refresh();
              onAnswer();
            }}
          >
            <span className="flows_basicsV2_survey_popover_radio_indicator" />
            {option.label}
          </button>
        );
      })}
      {question.otherOption && <OtherOption type="radio" question={question} />}
    </div>
  );
};
