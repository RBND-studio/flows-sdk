import { type StateMemory, type ChecklistItem as ChecklistItemType } from "@flows/shared";
// eslint-disable-next-line import/no-named-as-default -- correct import
import DOMPurify from "dompurify";
import { html, type TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Check16 } from "../../icons/check-16";
import { Chevron16 } from "../../icons/chevron-16";
import { Text } from "../../internal-components/text";
import { ActionButton } from "../../internal-components/action-button";

type Props = ChecklistItemType & {
  index: number;
  expanded: boolean;
  toggleExpanded: (index: number) => void;
  onNonManualButtonClick: () => void;
};

const getIsManualTrigger = (completed: StateMemory): boolean => {
  const isManualTrigger =
    completed.triggers.length === 1 && completed.triggers.at(0)?.type === "manual";
  return isManualTrigger;
};

export const ChecklistItem = (props: Props): TemplateResult => {
  const handleClick = (): void => {
    props.toggleExpanded(props.index);
  };

  const handleButtonClick = (): void => {
    if (!getIsManualTrigger(props.completed)) {
      props.onNonManualButtonClick();
    }
  };

  const handlePrimaryButtonClick = (): void => {
    // Complete the item if it's manual trigger only
    if (getIsManualTrigger(props.completed)) {
      props.completed.setValue(true);
    }
    handleButtonClick();
  };

  return html`
    <div
      class="flows_basicsV2_floating_checklist_item"
      data-expanded=${props.expanded ? "true" : "false"}
    >
      <button
        type="button"
        class="flows_basicsV2_floating_checklist_item_expand_button"
        @click=${handleClick}
        data-expanded=${props.expanded ? "true" : "false"}
      >
        ${Indicator({ completed: props.completed.value })}
        <span class="flows_basicsV2_floating_checklist_item_title">
          ${unsafeHTML(
            DOMPurify.sanitize(props.title, {
              FORCE_BODY: true,
              ADD_ATTR: ["target"],
            }),
          )}
        </span>
        ${Chevron16({
          className: "flows_basicsV2_floating_checklist_item_chevron",
          "data-expanded": props.expanded ? "true" : "false",
          "aria-hidden": "true",
        })}
      </button>
      <div
        class="flows_basicsV2_floating_checklist_item_content"
        data-expanded=${props.expanded ? "true" : "false"}
      >
        <div class="flows_basicsV2_floating_checklist_item_content_inner">
          ${props.description
            ? Text({
                variant: "body",
                children: unsafeHTML(
                  DOMPurify.sanitize(props.description, {
                    FORCE_BODY: true,
                    ADD_ATTR: ["target"],
                  }),
                ),
              })
            : null}
          ${(props.primaryButton ?? props.secondaryButton)
            ? html`<div class="flows_basicsV2_floating_checklist_item_buttons">
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
                      onClick: handleButtonClick,
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
    return html`<div
      class="flows_basicsV2_floating_checklist_item_indicator flows_basicsV2_floating_checklist_item_indicator_completed"
    >
      ${Check16()}
    </div>`;
  }

  return html`<div class="flows_basicsV2_floating_checklist_item_indicator"></div>`;
};
