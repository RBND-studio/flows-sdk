import type { FreeformQuestion } from "@flows/shared";
import type { TemplateResult } from "lit";
import { html } from "lit";
import { questionState, useQuestionContext } from "./question-context";
import { watch } from "@lit-labs/preact-signals";

const DEFAULT_PLACEHOLDER = "Start typing...";

type Props = {
  question: FreeformQuestion;
  legendId: string;
  descriptionId: string;
};

export const FreeformInput = ({ question, legendId, descriptionId }: Props): TemplateResult => {
  const { value, refresh } = useQuestionContext();

  console.log("freeform", { value }, watch(questionState));

  const handleChange = (e: InputEvent) => {
    const target = e.target as HTMLTextAreaElement;
    question.setValue(target.value);
    refresh();
  };

  return html`<textarea
    class="flows_basicsV2_survey_popover_freeform_textarea"
    aria-labelledby=${legendId}
    aria-describedby=${descriptionId}
    .defaultValue=${value ?? ""}
    @change=${handleChange}
    placeholder=${question.placeholder || DEFAULT_PLACEHOLDER}
    rows="4"
  ></textarea>`;
};
