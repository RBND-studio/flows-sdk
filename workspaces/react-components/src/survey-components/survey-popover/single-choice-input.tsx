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

  const handleClick = (optionId: string) => {
    question.setSelectedOptionIds([optionId]);
    refresh();
    onAnswer();
  };

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
            onClick={() => handleClick(option.id)}
          >
            <span className="flows_basicsV2_survey_popover_radio_indicator" />
            {option.label}
          </button>
        );
      })}
      {question.otherOption && <OtherOption question={question} />}
    </div>
  );
};
