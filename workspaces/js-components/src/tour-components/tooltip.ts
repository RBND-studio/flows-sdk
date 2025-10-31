import {
  type TourTooltipProps,
  type FlowsProperties,
  type Placement,
  type TourComponentProps,
  type Action,
} from "@flows/shared";
import { LitElement, type TemplateResult, html } from "lit";
import { property } from "lit/decorators.js";
import { defineBaseTooltip } from "../internal-components/base-tooltip";
import { ActionButton } from "../internal-components/action-button";

export type TooltipProps = TourComponentProps<TourTooltipProps>;

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
  previous?: () => void;

  @property({ type: Function })
  cancel: () => void;

  __flows: FlowsProperties;

  createRenderRoot(): this {
    return this;
  }

  render(): TemplateResult {
    const primaryBtn = this.primaryButton
      ? ActionButton({ action: this.primaryButton, variant: "primary" })
      : null;
    const secondaryBtn = this.secondaryButton
      ? ActionButton({ action: this.secondaryButton, variant: "secondary" })
      : null;

    const buttons =
      Boolean(primaryBtn) || Boolean(secondaryBtn)
        ? [
            primaryBtn ?? html`<div aria-hidden="true"></div>`,
            secondaryBtn ?? html`<div aria-hidden="true"></div>`,
          ]
        : [];

    return html`<flows-base-tooltip
      .title=${this.title}
      .body=${this.body}
      .targetElement=${this.targetElement}
      .placement=${this.placement}
      .overlay=${!this.hideOverlay}
      .close=${this.dismissible ? this.cancel : undefined}
      .buttons=${buttons}
    ></flows-base-tooltip>`;
  }
}
