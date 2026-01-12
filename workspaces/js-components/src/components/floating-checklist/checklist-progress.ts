import { html, type TemplateResult } from "lit";

interface Props {
  totalItems: number;
  completedItems: number;
}

export const ChecklistProgress = (props: Props): TemplateResult => {
  return html`
    <div class="flows_basicsV2_floating_checklist_progress">
      <p class="flows_basicsV2_floating_checklist_progress_text">
        ${props.completedItems} / ${props.totalItems}
      </p>
      <div
        class="flows_basicsV2_floating_checklist_progress_bar"
        aria-valuemin=${0}
        aria-valuemax=${props.totalItems}
        aria-valuenow=${props.completedItems}
        role="progressbar"
      >
        <div
          class="flows_basicsV2_floating_checklist_progress_bar_filled"
          style="width: ${(props.completedItems / props.totalItems) * 100}%"
        ></div>
      </div>
    </div>
  `;
};
