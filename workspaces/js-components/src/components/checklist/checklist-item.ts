import { type ChecklistItem as ChecklistItemType } from "@flows/shared";
import { html, type TemplateResult } from "lit";
import { Check16 } from "../../icons/check-16";
import { Chevron16 } from "../../icons/chevron-16";
import { Text } from "../../internal-components/text";
import { ActionButton } from "../../internal-components/action-button";

type Props = ChecklistItemType & {
  index: number;
  expanded: boolean;
  toggleExpanded: (index: number) => void;
};

export const ChecklistItem = (props: Props): TemplateResult => {
  const handleClick = (): void => {
    props.toggleExpanded(props.index);
  };

  const handlePrimaryButtonClick = (): void => {
    const firstStateMemoryTrigger = props.completed.triggers.at(0);
    // Complete the item if it's manual trigger only
    if (props.completed.triggers.length === 1 && firstStateMemoryTrigger?.type === "manual") {
      props.completed.setValue(true);
    }
  };

  return html`
    <div class="flows_basicsV2_checklist_item" data-expanded=${props.expanded ? "true" : "false"}>
      <button
        type="button"
        class="flows_basicsV2_checklist_item_expand_button"
        @click=${handleClick}
        data-expanded=${props.expanded ? "true" : "false"}
      >
        ${Indicator({ completed: props.completed.value })}
        <span class="flows_basicsV2_checklist_item_title">${props.title}</span>
        ${Chevron16({
          className: "flows_basicsV2_checklist_item_chevron",
          "data-expanded": props.expanded ? "true" : "false",
          "aria-hidden": "true",
        })}
      </button>
      <div
        class="flows_basicsV2_checklist_item_content"
        data-expanded=${props.expanded ? "true" : "false"}
      >
        <div class="flows_basicsV2_checklist_item_content_inner">
          ${props.description ? Text({ variant: "body", children: props.description }) : null}
          ${(props.primaryButton ?? props.secondaryButton)
            ? html`<div class="flows_basicsV2_checklist_item_buttons">
                ${props.primaryButton
                  ? ActionButton({
                      action: props.primaryButton,
                      variant: "primary",
                      size: "small",
                      onClick: handlePrimaryButtonClick,
                    })
                  : null}
                ${props.secondaryButton
                  ? ActionButton({
                      action: props.secondaryButton,
                      variant: "secondary",
                      size: "small",
                    })
                  : null}
              </div>`
            : null}
        </div>
      </div>
    </div>
  `;
};

const Indicator = (props: { completed: boolean }): TemplateResult => {
  if (props.completed) {
    return html` <div
      class="flows_basicsV2_checklist_item_indicator flows_basicsV2_checklist_item_indicator_completed"
    >
      ${Check16()}
    </div>`;
  }

  return html` <div class="flows_basicsV2_checklist_item_indicator"></div> `;
};
