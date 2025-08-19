import classNames from "classnames";
import { html, type TemplateResult } from "lit";
import { type unsafeHTML } from "lit/directives/unsafe-html.js";

interface Props {
  children: string | ReturnType<typeof unsafeHTML>;
  variant: "title" | "body";
  className?: string;
}

export const Text = ({ children, variant, className }: Props): TemplateResult => {
  return html`<p class=${classNames("flows_text", `flows_text_${variant}`, className)}>
    ${children}
  </p>`;
};
