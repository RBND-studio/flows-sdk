import {
  type TourTooltipProps,
  type FlowsProperties,
  type Placement,
  type TourComponentProps,
} from "@flows/shared";
import { LitElement, type TemplateResult, html } from "lit";
import { property } from "lit/decorators.js";
import { defineBaseTooltip } from "../internal-components/base-tooltip";
import { Button } from "../internal-components/button";

export type TooltipProps = TourComponentProps<TourTooltipProps>;

defineBaseTooltip();
export class Tooltip extends LitElement implements TooltipProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: String })
  continueText?: string;

  @property({ type: String })
  previousText?: string;

  @property({ type: String })
  targetElement: string;

  @property({ type: Boolean })
  showCloseButton: boolean;

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
    let previousButton: TemplateResult | null = null;
    if (this.previous && this.previousText) {
      previousButton = Button({
        variant: "secondary",
        children: this.previousText,
        onClick: this.previous,
      });
    }

    let continueButton: TemplateResult | null = null;
    if (this.continueText) {
      continueButton = Button({
        variant: "primary",
        children: this.continueText,
        onClick: this.continue,
      });
    }

    const buttons =
      Boolean(continueButton) || Boolean(previousButton)
        ? [
            previousButton ?? html`<div aria-hidden="true"></div>`,
            continueButton ?? html`<div aria-hidden="true"></div>`,
          ]
        : [];

    return html`<flows-base-tooltip
      .title=${this.title}
      .body=${this.body}
      .targetElement=${this.targetElement}
      .placement=${this.placement}
      .overlay=${!this.hideOverlay}
      .close=${this.showCloseButton ? this.cancel : undefined}
      .buttons=${buttons}
    ></flows-base-tooltip>`;
  }
}
