import { html, type TemplateResult } from "lit";

interface Props {
  label: string;
  secondary?: TemplateResult | string;
  onClick?: () => void;
}

export const DebugItem = ({ label, secondary, onClick }: Props): TemplateResult => {
  return html`<button
    class="flows-debug-item flows-debug-item-interactive"
    @click=${onClick}
    type="button"
  >
    <span class="flows-debug-item-label">${label}</span>
    ${secondary ? html`<span class="flows-debug-item-secondary">${secondary}</span>` : null}
  </button>`;
};
