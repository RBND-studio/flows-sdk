import { SURVEY_POPOVER_DEFAULT_FREEFORM_PLACEHOLDER, type FreeformQuestion } from "@flows/shared";
import type { TemplateResult } from "lit";
import { Input } from "../../internal-components/input";
import type { IQuestionContext } from "./question-context";

type Props = {
  question: FreeformQuestion;
  legendId: string;
  descriptionId: string;
  context: IQuestionContext;
};

export const FreeformInput = ({
  question,
  legendId,
  descriptionId,
  context,
}: Props): TemplateResult => {
  const { value, refresh } = context;

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
