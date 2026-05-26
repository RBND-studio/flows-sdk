import { isInternalLink, type ButtonSize, type ButtonVariant } from "@flows/shared";
import { clsx } from "clsx";
import { type TemplateResult } from "lit";
import { html, literal } from "lit/static-html.js";

interface Props {
  className?: string;
  children?: string;
  onClick?: () => void;
  variant: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  target?: "_blank";
  disabled?: boolean;
}

const buttonLiteral = literal`button`;
const aLiteral = literal`a`;

export const Button = ({
  className: classNameProp,
  variant,
  size = "default",
  children,
  onClick,
  href,
  target,
  disabled,
}: Props): TemplateResult => {
  const tag = href ? aLiteral : buttonLiteral;

  const className = clsx(
    "flows_basicsV2_button",
    `flows_basicsV2_button_${variant}`,
    `flows_basicsV2_button_size_${size}`,
    disabled && "flows_basicsV2_button_disabled",
    classNameProp,
  );

  const handleClick = (event: PointerEvent) => {
    // The click is fired before the navigation, this is in line with how e.g. "next/link" works
    onClick?.();

    const navigationHandler = window.__flows_onNavigate;
    if (
      navigationHandler &&
      typeof navigationHandler === "function" &&
      href &&
      isInternalLink(href, target)
    ) {
      navigationHandler(href, event);
    }
  };

  return html`
    <${tag}
      type=${tag === buttonLiteral ? "button" : undefined}
      class=${className}
      @click=${handleClick}
      target=${target}
      href=${href}
      ?disabled=${disabled}
    >
      ${children}
    </${tag}>
  `;
};
