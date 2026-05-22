import { clsx } from "clsx";
import { html, type TemplateResult } from "lit";

interface Props {
  className?: string;
  value: number;
  max: number;
}

export const Progress = ({ max, value, className }: Props): TemplateResult => {
  const width = (value / max) * 100 || 0;

  return html`<div
    class=${clsx("flows_basicsV2_progress", className)}
    aria-valuemin=${0}
    aria-valuemax=${max}
    aria-valuenow=${value}
    role="progressbar"
  >
    <div class="flows_basicsV2_progress_indicator" style="width: ${width}%"></div>
  </div>`;
};
