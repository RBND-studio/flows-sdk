import { clsx } from "clsx";
import { type TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { type unsafeHTML } from "lit/directives/unsafe-html.js";
import { html, literal } from "lit/static-html.js";

interface Props {
  id?: string;
  children: string | ReturnType<typeof unsafeHTML>;
  variant: "title" | "body";
  className?: string;
  as?: "legend" | "p";
}

const legendLiteral = literal`legend`;
const pLiteral = literal`p`;

export const Text = ({ children, variant, className, as, id }: Props): TemplateResult => {
  const tag = (() => {
    if (as === "legend") return legendLiteral;
    return pLiteral;
  })();

  return html`<${tag} class=${clsx("flows_basicsV2_text", `flows_basicsV2_text_${variant}`, className)} id=${ifDefined(id)}>
    ${children}
  </${tag}>`;
};
