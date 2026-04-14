import clsx from "clsx";
import type { TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import type { RefOrCallback } from "lit/directives/ref.js";
import { ref } from "lit/directives/ref.js";
import { literal, html } from "lit/static-html.js";

type Props = {
  as?: "input" | "textarea";
  type?: "text";
  className?: string;
  onInput?: (event: InputEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  name?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  ref?: RefOrCallback;
};

const inputLiteral = literal`input`;
const textareaLiteral = literal`textarea`;

export const Input = ({
  as,
  className,
  onInput,
  onBlur,
  defaultValue,
  placeholder,
  rows,
  type,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  name,
  ref: _ref,
}: Props): TemplateResult => {
  const tag = as === "textarea" ? textareaLiteral : inputLiteral;

  return html`<${tag}
    ${_ref ? ref(_ref) : undefined}
    class=${clsx("flows_basicsV2_input", className)}
    @input=${onInput}
    @blur=${onBlur}
    type=${ifDefined(type)}
    .defaultValue=${defaultValue ?? ""}
    placeholder=${ifDefined(placeholder)}
    rows=${ifDefined(rows)}
    aria-labelledby=${ifDefined(ariaLabelledBy)}
    aria-describedby=${ifDefined(ariaDescribedBy)}
    name=${ifDefined(name)}
  />`;
};
