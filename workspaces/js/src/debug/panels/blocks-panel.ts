import { type Block } from "@flows/shared";
import { html, type TemplateResult } from "lit";

interface Props {
  blocks: Block[];
  activeBlockCount: number;
}

export const BlocksPanel = ({ blocks, activeBlockCount }: Props): TemplateResult => {
  return html`<p class="flows-debug-info-line"><strong>Loaded blocks:</strong> ${blocks.length}</p>
    <p class="flows-debug-info-line"><strong>Active blocks:</strong> ${activeBlockCount}</p>
    <p class="flows-debug-info-line">
      <strong>Blocks JSON:</strong>
    </p>
    <pre class="flows-debug-code-block">${JSON.stringify(blocks, null, 2)}</pre>
    <button
      class="flows-debug-button-secondary flows-debug-print-button"
      type="button"
      @click=${() => {
        // eslint-disable-next-line no-console -- feature for debugging
        console.log(blocks);
      }}
    >
      Print to console
    </button>`;
};
