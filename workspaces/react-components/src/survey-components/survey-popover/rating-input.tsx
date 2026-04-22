import { SURVEY_EMOJIS, type RatingDisplayType, type RatingQuestion } from "@flows/shared";
import { Text } from "../../internal-components/text";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { StarFilled16 } from "../../icons/star-filled16";
import { StarEmpty16 } from "../../icons/star-empty16";
import { useQuestionContext } from "./question-context";
import { range } from "es-toolkit";

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

  const options = useMemo(
    () => range(question.minValue, question.maxValue + 1),
    [question.minValue, question.maxValue],
  );
  const valueIndex = options.findIndex((optValue) => optValue.toString() === value);

  return (
    <>
      <div
        className="flows_basicsV2_survey_popover_rating_list"
        role="radiogroup"
        aria-labelledby={legendId}
        aria-describedby={descriptionId}
      >
        {options.map((optValue, index) => {
          const isSelected = value === optValue.toString();
          return (
            <button
              className="flows_basicsV2_survey_popover_rating_option"
              role="radio"
              type="button"
              aria-checked={isSelected}
              aria-label={`${optValue} out of ${question.maxValue}`}
              onClick={() => handleSetValue(optValue.toString())}
              key={optValue}
              data-selected={isSelected ? "true" : "false"}
              onPointerEnter={() => setHoverIndex(index)}
              onPointerLeave={() => setHoverIndex(null)}
            >
              <DisplayRender
                displayType={question.displayType}
                value={optValue}
                index={index}
                activeIndex={hoverIndex ?? valueIndex}
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
  value: number;
  index: number;
  activeIndex?: number;
};

const DisplayRender: FC<DisplayRenderProps> = ({
  displayType,
  value,
  index,
  activeIndex,
}: DisplayRenderProps) => {
  if (displayType === "numbers") {
    return <span>{value}</span>;
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
    return <span>{SURVEY_EMOJIS[index]}</span>;
  }

  return null;
};
