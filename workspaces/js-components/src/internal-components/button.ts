import { type ButtonVariant } from "@flows/shared";
import classNames from "classnames";
import { type TemplateResult } from "lit";
import { html, literal } from "lit/static-html.js";

interface Props {
  className?: string;
  children?: string;
  onClick?: () => void;
  variant: ButtonVariant;
  href?: string;
  target?: "_blank";
}

const buttonLiteral = literal`button`;
const aLiteral = literal`a`;

export const Button = ({
  className,
  variant,
  children,
  onClick,
  href,
  target,
}: Props): TemplateResult => {
  const tag = href ? aLiteral : buttonLiteral;

  return html`
    <${tag}
      type=${tag === buttonLiteral ? "button" : undefined}
      class=${classNames("flows_basicsV2_button", `flows_basicsV2_button_${variant}`, className)}
      @click=${onClick}
      target=${target}
      href=${href}
    >
      ${children}
    </button>
  `;
};
