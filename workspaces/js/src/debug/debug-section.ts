import { type TemplateResult, html } from "lit";
import { ArrowLeft } from "./icons/arrow-left";

interface Props {
  label: string;
  children: TemplateResult;
  onClose?: () => void;
}

export const DebugSection = ({ children, label, onClose }: Props): TemplateResult => {
  return html`<div class="flows-debug-popover-wide">
    <div class="flows-debug-section-header">
      <button class="flows-debug-btn flows-debug-section-close" @click=${onClose} type="button">
        ${ArrowLeft()}
      </button>
      <p class="flows-debug-section-label">${label}</p>
    </div>
    <div class="flows-debug-section-content">${children}</div>
  </div>`;
};
