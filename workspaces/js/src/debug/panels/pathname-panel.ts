import { html, type TemplateResult } from "lit";

interface Props {
  pathname?: string;
}

export const PathnamePanel = ({ pathname }: Props): TemplateResult => {
  return html`<p>${pathname}</p>`;
};
