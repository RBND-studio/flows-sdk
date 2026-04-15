import { SURVEY_POPOVER_DEFAULT_FREEFORM_PLACEHOLDER, type FreeformQuestion } from "@flows/shared";
import type { TemplateResult } from "lit";
import { useQuestionContext } from "./question-context";
import { Input } from "../../internal-components/input";

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
    placeholder: question.placeholder || SURVEY_POPOVER_DEFAULT_FREEFORM_PLACEHOLDER,
    rows: 4,
  });
};
