import {
  type TourHintProps,
  type FlowsProperties,
  type Placement,
  type TourComponentProps,
  type Action,
} from "@flows/shared";
import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { defineBaseHint } from "../internal-components/base-hint";
import { Dots } from "../internal-components/dots";

export type HintProps = TourComponentProps<TourHintProps>;

defineBaseHint();

class Hint extends LitElement implements HintProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: Object })
  primaryButton?: Action;

  @property({ type: Object })
  secondaryButton?: Action;

  @property({ type: Boolean })
  dismissible: boolean;

  @property({ type: String })
  targetElement: string;

  @property({ type: String })
  placement?: Placement;

  @property({ type: Number })
  offsetX?: number;

  @property({ type: Number })
  offsetY?: number;

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

  render(): unknown {
    const dots = !this.hideProgress
      ? Dots({
          count: this.__flows.tourVisibleStepCount ?? 0,
          index: this.__flows.tourVisibleStepIndex ?? 0,
        })
      : undefined;

    return keyed(
      // Needed to avoid reusing html elements between tour steps. Otherwise the tooltip exit animation is triggered.
      this.__flows.id,
      html`<flows-base-hint
        .title=${this.title}
        .body=${this.body}
        .targetElement=${this.targetElement}
        .placement=${this.placement}
        .offsetX=${this.offsetX}
        .offsetY=${this.offsetY}
        .onClose=${this.dismissible ? this.cancel : undefined}
        .primaryButton=${this.primaryButton}
        .secondaryButton=${this.secondaryButton}
        .dots=${dots}
      ></flows-base-hint>`,
    );
  }
}

export const BasicsV2Hint = Hint;
