import classNames from "classnames";
import { type TemplateResult, html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

interface Props {
  className?: string;
  children?: TemplateResult;
  onClick?: () => void;
  "aria-label"?: string;
}

export const IconButton = ({
  className,
  "aria-label": ariaLabel,
  children,
  onClick,
}: Props): TemplateResult => {
  return html`<button
    type="button"
    @click=${onClick}
    aria-label=${ifDefined(ariaLabel)}
    class=${classNames("flows_iconButton", className)}
  >
    ${children}
  </button>`;
};
