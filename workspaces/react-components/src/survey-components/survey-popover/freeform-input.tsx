import type { FreeformQuestion } from "@flows/shared";
import type { FC } from "react";
import { useQuestionContext } from "./question-context";
import { Input } from "../../internal-components/input";

const DEFAULT_PLACEHOLDER = "Start typing...";

type Props = {
  question: FreeformQuestion;
  legendId: string;
  descriptionId: string;
};

export const FreeformInput: FC<Props> = ({ question, descriptionId, legendId }) => {
  const { value, refresh } = useQuestionContext();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    question.setValue(e.target.value);
    refresh();
  };

  return (
    <Input
      as="textarea"
      className="flows_basicsV2_survey_popover_freeform_textarea"
      aria-labelledby={legendId}
      aria-describedby={descriptionId}
      defaultValue={value}
      onChange={handleChange}
      placeholder={question.placeholder || DEFAULT_PLACEHOLDER}
      rows={4}
    />
  );
};
