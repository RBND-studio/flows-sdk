import {
  type Action,
  type ChecklistItem as ChecklistItemType,
  type ChecklistPosition,
  type ComponentProps,
  type FlowsProperties,
  type FloatingChecklistProps as LibraryFloatingChecklistProps,
} from "@flows/shared";
import { html, LitElement } from "lit";
import { property, queryAll, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { Rocket16 } from "../../icons/rocket-16";
import { Chevron16 } from "../../icons/chevron-16";
import { Text } from "../../internal-components/text";
import { ActionButton } from "../../internal-components/action-button";
import { ChecklistProgress } from "./checklist-progress";
import { ChecklistItem } from "./checklist-item";

export type FloatingChecklistProps = ComponentProps<LibraryFloatingChecklistProps>;

const CLOSE_TIMEOUT = 300;

class FloatingChecklist extends LitElement implements FloatingChecklistProps {
  @property()
  widgetTitle: string;

  @property()
  position?: ChecklistPosition;

  @property()
  popupTitle: string;

  @property()
  popupDescription: string;

  @property()
  completedTitle: string;

  @property()
  completedDescription: string;

  @property({ type: Object })
  completeButton?: Action;

  @property({ type: Array })
  items: ChecklistItemType[];

  @property({ type: Object })
  skipButton?: Action;

  @property({ type: Function })
  complete: () => void;

  @property({ type: Function })
  close: () => void;

  __flows: FlowsProperties;

  @state()
  private accessor _checklistOpen = false;

  @state()
  private accessor _checklistClosing = false;

  @state()
  private accessor _expandedItemIndex: number | null = null;

  private _closeTimeout: number | null = null;
  handleClick(): void {
    if (this._checklistOpen && !this._checklistClosing) {
      this._checklistClosing = true;
      this._closeTimeout = window.setTimeout(() => {
        this._checklistOpen = false;
        this._checklistClosing = false;
        this._closeTimeout = null;
      }, CLOSE_TIMEOUT);
    } else {
      this._checklistOpen = true;
      this._checklistClosing = false;
      window.clearTimeout(this._closeTimeout ?? undefined);
      this._closeTimeout = null;
    }
  }

  handleToggleExpanded(index: number): void {
    this._expandedItemIndex = this._expandedItemIndex === index ? null : index;
  }

  @queryAll(".flows_basicsV2_floating_checklist_item_content")
  itemContentElements: NodeListOf<HTMLElement>;
  updated(): void {
    this.itemContentElements.forEach((el) => {
      el.style.setProperty("--flows-content-height", `${el.scrollHeight}px`);
    });
  }

  createRenderRoot(): this {
    return this;
  }

  render(): unknown {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- value can be empty string ""
    const position = this.position || "bottom-right";

    const completedItems = this.items.filter((item) => item.completed.value);
    const isCompleted = this.items.length === completedItems.length;

    return html`
      <div class="flows_basicsV2_floating_checklist" data-position=${position}>
        <button
          type="button"
          class="flows_basicsV2_floating_checklist_widget_button"
          @click=${this.handleClick.bind(this)}
        >
          ${Rocket16({ "aria-hidden": "true" })} ${this.widgetTitle}
          ${Chevron16({
            "aria-hidden": "true",
            "data-open": this._checklistOpen && !this._checklistClosing ? "true" : "false",
            className: "flows_basicsV2_floating_checklist_widget_button_chevron",
          })}
        </button>

        ${this._checklistOpen
          ? html`
              <div
                class="flows_basicsV2_floating_checklist_popover"
                data-open=${!this._checklistClosing ? "true" : "false"}
              >
                <div class="flows_basicsV2_floating_checklist_header">
                  ${Text({
                    variant: "title",
                    className: "flows_basicsV2_floating_checklist_title",
                    children: this.popupTitle,
                  })}
                  ${Text({ variant: "body", children: this.popupDescription })}
                </div>

                ${ChecklistProgress({
                  totalItems: this.items.length,
                  completedItems: completedItems.length,
                })}
                ${!isCompleted &&
                html`<div class="flows_basicsV2_floating_checklist_items">
                  ${repeat(
                    this.items,
                    (_item, index) => index,
                    (item, index) =>
                      ChecklistItem({
                        ...item,
                        index,
                        expanded: this._expandedItemIndex === index,
                        toggleExpanded: this.handleToggleExpanded.bind(this),
                      }),
                  )}
                  ${this.skipButton
                    ? html`<div class="flows_basicsV2_floating_checklist_skip_button">
                        ${ActionButton({ variant: "text", action: this.skipButton })}
                      </div>`
                    : null}
                </div>`}
                ${isCompleted &&
                html`<div class="flows_basicsV2_floating_checklist_completed">
                  <div class="flows_basicsV2_floating_checklist_completed_inner">
                    ${Text({
                      variant: "title",
                      children: this.completedTitle,
                      className: "flows_basicsV2_floating_checklist_completed_title",
                    })}
                    ${Text({
                      variant: "body",
                      children: this.completedDescription,
                      className: "flows_basicsV2_floating_checklist_completed_description",
                    })}
                    ${this.completeButton
                      ? ActionButton({
                          variant: "primary",
                          size: "small",
                          action: this.completeButton,
                        })
                      : null}
                  </div>
                </div> `}
              </div>
            `
          : null}
      </div>
    `;
  }
}

export const BasicsV2FloatingChecklist = FloatingChecklist;
