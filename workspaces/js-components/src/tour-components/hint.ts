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
import { ActionButton } from "../internal-components/action-button";

export type HintProps = TourComponentProps<TourHintProps>;

defineBaseHint();

export class Hint extends LitElement implements HintProps {
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
    const primaryBtn = this.primaryButton
      ? ActionButton({ action: this.primaryButton, variant: "primary" })
      : null;
    const secondaryBtn = this.secondaryButton
      ? ActionButton({ action: this.secondaryButton, variant: "secondary" })
      : null;

    const buttons =
      Boolean(primaryBtn) || Boolean(secondaryBtn)
        ? [
            secondaryBtn ?? html`<div aria-hidden="true"></div>`,
            primaryBtn ?? html`<div aria-hidden="true"></div>`,
          ]
        : [];

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
        .buttons=${buttons}
      ></flows-base-hint>`,
    );
  }
}
