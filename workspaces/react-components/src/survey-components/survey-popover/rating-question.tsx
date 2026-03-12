import type { SurveyQuestion } from "@flows/shared/src/types/survey";
import { Text } from "../../internal-components/text";
import { useState } from "react";
import { StarFilled16 } from "../../icons/star-filled16";
import { StarEmpty16 } from "../../icons/star-empty16";

type Props = {
  currentQuestion: SurveyQuestion;
  onAnswer: () => void;
  legendId: string;
  descriptionId: string;
};

export const RatingQuestion = ({ currentQuestion, onAnswer, legendId, descriptionId }: Props) => {
  if (currentQuestion.type !== "rating") return null;

  const [selected, setSelected] = useState(currentQuestion.getInitialValue());
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleSetValue = (value: string) => {
    setSelected(value);
    currentQuestion.setValue(value);
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
        {Array(currentQuestion.scale)
          .fill(null)
          .map((_, i) => {
            const isSelected = selected === i.toString();
            return (
              <button
                className="flows_basicsV2_survey_popover_rating_option"
                role="radio"
                type="button"
                aria-checked={isSelected}
                aria-label={`${i + 1} out of ${currentQuestion.scale}`}
                onClick={() => {
                  handleSetValue(i.toString());
                }}
                key={i}
                data-selected={isSelected ? "true" : "false"}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <DisplayRender
                  displayType={currentQuestion.displayType}
                  value={i + 1}
                  selectedValue={selected ? parseInt(selected) + 1 : undefined}
                  hoverValue={hoverIndex !== null ? hoverIndex + 1 : undefined}
                />
              </button>
            );
          })}
      </div>
      {currentQuestion.upperBoundLabel && currentQuestion.lowerBoundLabel && (
        <div className="flows_basicsV2_survey_popover_bound_labels">
          <Text variant="body">{currentQuestion.lowerBoundLabel}</Text>
          <Text variant="body">{currentQuestion.upperBoundLabel}</Text>
        </div>
      )}
    </>
  );
};

type DisplayRenderProps = {
  displayType: "numbers" | "stars" | "smileys";
  value: number;
  selectedValue?: number;
  hoverValue?: number;
};

const DisplayRender = ({ displayType, value, selectedValue, hoverValue }: DisplayRenderProps) => {
  if (displayType === "numbers") {
    return <span>{value}</span>;
  }

  if (displayType === "stars") {
    const isHovered = hoverValue !== undefined && value <= hoverValue;
    const isSelected = selectedValue !== undefined && value <= selectedValue;
    const highlight = isHovered || (!isHovered && hoverValue === undefined && isSelected);

    return (
      <span
        className={`flows_basicsV2_survey_popover_rating_star ${highlight ? "flows_basicsV2_survey_popover_rating_star_highlighted" : "flows_basicsV2_survey_popover_rating_star_default"}`}
      >
        {highlight ? <StarFilled16 /> : <StarEmpty16 />}
      </span>
    );
  }

  if (displayType === "smileys") {
    const emojis = ["😞", "😐", "😊", "😀", "😍"];
    return <span>{emojis[value - 1]}</span>;
  }
};
