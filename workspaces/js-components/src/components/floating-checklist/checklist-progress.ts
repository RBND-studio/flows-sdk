import { html, type TemplateResult } from "lit";
import { Progress } from "../../internal-components/progress";

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
      ${Progress({ max: props.totalItems, value: props.completedItems })}
    </div>
  `;
};
