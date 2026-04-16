import type { MultipleChoiceQuestion } from "@flows/shared";
import { OtherOption } from "./other-option";
import { useQuestionContext } from "./question-context";

type Props = {
  question: MultipleChoiceQuestion;
  legendId: string;
  descriptionId: string;
};

export const MultipleChoiceInput = ({ question, legendId, descriptionId }: Props) => {
  const { optionIds, refresh } = useQuestionContext();

  return (
    <div
      className="flows_basicsV2_survey_popover_option_list"
      aria-labelledby={legendId}
      aria-describedby={descriptionId}
    >
      {question.options.map((option) => {
        const isSelected = optionIds.includes(option.id);
        return (
          <button
            key={option.id}
            // oxlint-disable-next-line jsx_a11y/prefer-tag-over-role -- intentionally using button
            role="checkbox"
            aria-checked={isSelected}
            className="flows_basicsV2_survey_popover_choice_option"
            data-selected={isSelected ? "true" : "false"}
            onClick={() => {
              const updatedOptionIds = isSelected
                ? optionIds.filter((id) => id !== option.id)
                : [...optionIds, option.id];
              question.setSelectedOptionIds(updatedOptionIds);
              refresh();
            }}
          >
            <span className="flows_basicsV2_survey_popover_checkbox_indicator" />
            {option.label}
          </button>
        );
      })}
      {question.otherOption && <OtherOption type="checkbox" question={question} />}
    </div>
  );
};
