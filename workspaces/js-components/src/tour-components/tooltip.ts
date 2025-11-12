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
import { Dots } from "../internal-components/dots";

export type TooltipProps = TourComponentProps<TourTooltipProps>;

defineBaseTooltip();
class Tooltip extends LitElement implements TooltipProps {
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

  @property({ type: Boolean })
  hideProgress: boolean;

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
    const dots = !this.hideProgress
      ? Dots({
          count: this.__flows.tourVisibleStepCount ?? 0,
          index: this.__flows.tourVisibleStepIndex ?? 0,
        })
      : undefined;

    return html`<flows-base-tooltip
      .title=${this.title}
      .body=${this.body}
      .targetElement=${this.targetElement}
      .placement=${this.placement}
      .overlay=${!this.hideOverlay}
      .onClose=${this.dismissible ? this.cancel : undefined}
      .primaryButton=${this.primaryButton}
      .secondaryButton=${this.secondaryButton}
      .dots=${dots}
    ></flows-base-tooltip>`;
  }
}

export const BasicsV2Tooltip = Tooltip;
