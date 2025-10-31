import {
  type ComponentProps,
  type Placement,
  type FlowsProperties,
  type TooltipProps as LibraryTooltipProps,
  type Action,
} from "@flows/shared";
import { html, LitElement, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { defineBaseTooltip } from "../internal-components/base-tooltip";
import { ActionButton } from "../internal-components/action-button";

export type TooltipProps = ComponentProps<LibraryTooltipProps>;

defineBaseTooltip();
export class Tooltip extends LitElement implements TooltipProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: Object })
  primaryButton?: Action;

  @property({ type: Object })
  secondaryButton?: Action;

  @property({ type: String })
  targetElement: string;

  @property({ type: Boolean })
  dismissible: boolean;

  @property({ type: String })
  placement?: Placement;

  @property({ type: Boolean })
  hideOverlay: boolean;

  @property({ type: Function })
  continue: () => void;

  @property({ type: Function })
  close: () => void;

  __flows: FlowsProperties;

  createRenderRoot(): this {
    return this;
  }

  render(): TemplateResult {
    const buttons = [];
    if (this.secondaryButton)
      buttons.push(ActionButton({ action: this.secondaryButton, variant: "secondary" }));
    if (this.primaryButton)
      buttons.push(ActionButton({ action: this.primaryButton, variant: "primary" }));

    return html`<flows-base-tooltip
      .title=${this.title}
      .body=${this.body}
      .targetElement=${this.targetElement}
      .placement=${this.placement}
      .overlay=${!this.hideOverlay}
      .close=${this.dismissible ? this.close : undefined}
      .buttons=${buttons}
    ></flows-base-tooltip>`;
  }
}
