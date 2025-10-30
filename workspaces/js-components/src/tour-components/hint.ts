import {
  type TourHintProps,
  type FlowsProperties,
  type Placement,
  type TourComponentProps,
} from "@flows/shared";
import { html, LitElement, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { defineBaseHint } from "../internal-components/base-hint";
import { Button } from "../internal-components/button";

export type HintProps = TourComponentProps<TourHintProps>;

defineBaseHint();

export class Hint extends LitElement implements HintProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: String })
  continueText?: string;

  @property({ type: String })
  previousText?: string;

  @property({ type: Boolean })
  showCloseButton: boolean;

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
        .onClose=${this.showCloseButton ? this.cancel : undefined}
        .buttons=${buttons}
      ></flows-base-hint>`,
    );
  }
}
