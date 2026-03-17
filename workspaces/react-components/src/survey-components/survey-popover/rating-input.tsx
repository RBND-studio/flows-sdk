import type { RatingDisplayType, RatingQuestion } from "@flows/shared";
import { Text } from "../../internal-components/text";
import { useState } from "react";
import { StarFilled16 } from "../../icons/star-filled16";
import { StarEmpty16 } from "../../icons/star-empty16";
import { useQuestionContext } from "./question-context";

type Props = {
  question: RatingQuestion;
  onAnswer: () => void;
  legendId: string;
  descriptionId: string;
};

export const RatingInput = ({ question, onAnswer, legendId, descriptionId }: Props) => {
  const { value, refresh } = useQuestionContext();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleSetValue = (value: string) => {
    question.setValue(value);
    refresh();
    onAnswer();
  };

  return (
    <>
      <div
        className="flows_basicsV2_survey_popover_rating_list"
        role="radiogroup"
        aria-labelledby={legendId}
        aria-describedby={descriptionId}
      >
        {Array(question.scale)
          .fill(null)
          .map((_, i) => {
            const isSelected = value === i.toString();
            return (
              <button
                className="flows_basicsV2_survey_popover_rating_option"
                role="radio"
                type="button"
                aria-checked={isSelected}
                aria-label={`${i + 1} out of ${question.scale}`}
                onClick={() => {
                  handleSetValue(i.toString());
                }}
                key={i}
                data-selected={isSelected ? "true" : "false"}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <DisplayRender
                  displayType={question.displayType}
                  index={i}
                  activeIndex={hoverIndex ?? (value ? parseInt(value) : undefined)}
                />
              </button>
            );
          })}
      </div>
      {question.upperBoundLabel && question.lowerBoundLabel && (
        <div className="flows_basicsV2_survey_popover_bound_labels">
          <Text variant="body">{question.lowerBoundLabel}</Text>
          <Text variant="body">{question.upperBoundLabel}</Text>
        </div>
      )}
    </>
  );
};

type DisplayRenderProps = {
  displayType: RatingDisplayType;
  index: number;
  activeIndex?: number;
};

const emojis = ["😞", "😐", "😊", "😀", "😍"];

const DisplayRender = ({ displayType, index, activeIndex }: DisplayRenderProps) => {
  if (displayType === "numbers") {
    return <span>{index + 1}</span>;
  }

  if (displayType === "stars") {
    const highlight = activeIndex !== undefined && index <= activeIndex;

    return (
      <span
        className="flows_basicsV2_survey_popover_rating_star"
        data-highlight={highlight ? "true" : "false"}
      >
        {highlight ? <StarFilled16 /> : <StarEmpty16 />}
      </span>
    );
  }

  if (displayType === "emojis") {
    return <span>{emojis[index]}</span>;
  }
};
