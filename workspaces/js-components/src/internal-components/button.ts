import classNames from "classnames";
import { html, type TemplateResult } from "lit";

interface Props {
  className?: string;
  children?: string;
  onClick?: () => void;
  variant: "primary" | "secondary";
}

export const Button = ({ className, variant, children, onClick }: Props): TemplateResult => {
  return html`
    <button
      type="button"
      class=${classNames("flows_button", `flows_button_${variant}`, className)}
      @click=${onClick}
    >
      ${children}
    </button>
  `;
};
