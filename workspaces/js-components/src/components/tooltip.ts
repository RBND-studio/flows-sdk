import {
  type ComponentProps,
  type Placement,
  type FlowsProperties,
  type TooltipProps as LibraryTooltipProps,
} from "@flows/shared";
import { html, LitElement, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { defineBaseTooltip } from "../internal-components/base-tooltip";
import { Button } from "../internal-components/button";

export type TooltipProps = ComponentProps<LibraryTooltipProps>;

defineBaseTooltip();
export class Tooltip extends LitElement implements TooltipProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: String })
  continueText?: string;

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
  close: () => void;

  __flows: FlowsProperties;

  createRenderRoot(): this {
    return this;
  }

  render(): TemplateResult {
    const buttons: TemplateResult[] = [];
    if (this.continueText) {
      buttons.push(
        Button({
          onClick: this.continue,
          variant: "primary",
          children: this.continueText,
        }),
      );
    }

    return html`<flows-base-tooltip
      .title=${this.title}
      .body=${this.body}
      .targetElement=${this.targetElement}
      .placement=${this.placement}
      .overlay=${!this.hideOverlay}
      .close=${this.showCloseButton ? this.close : undefined}
      .buttons=${buttons}
    ></flows-base-tooltip>`;
  }
}
