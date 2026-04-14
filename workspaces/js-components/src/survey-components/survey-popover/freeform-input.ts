import type { FreeformQuestion } from "@flows/shared";
import type { TemplateResult } from "lit";
import { useQuestionContext } from "./question-context";
import { Input } from "../../internal-components/input";

const DEFAULT_PLACEHOLDER = "Start typing...";

type Props = {
  question: FreeformQuestion;
  legendId: string;
  descriptionId: string;
};

export const FreeformInput = ({ question, legendId, descriptionId }: Props): TemplateResult => {
  const { value, refresh } = useQuestionContext();

  const handleChange = (e: InputEvent) => {
    const target = e.target as HTMLTextAreaElement;
    question.setValue(target.value);
    refresh();
  };

  return Input({
    as: "textarea",
    className: "flows_basicsV2_survey_popover_freeform_textarea",
    "aria-labelledby": legendId,
    "aria-describedby": descriptionId,
    defaultValue: value,
    onInput: handleChange,
    placeholder: question.placeholder || DEFAULT_PLACEHOLDER,
    rows: 4,
  });
};
