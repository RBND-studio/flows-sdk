import { html, type TemplateResult } from "lit";

interface Props {
  pathname?: string;
}

export const PathnamePanel = ({ pathname }: Props): TemplateResult => {
  return html`<p class="flows-debug-info-line">
      <strong>Pathname:</strong>
    </p>
    <p class="flows-debug-code-block flows-debug-info-line">${pathname}</p>
    <p class="flows-debug-info-line">
      This pathname is used when evaluating page targeting conditions.
    </p>`;
};
