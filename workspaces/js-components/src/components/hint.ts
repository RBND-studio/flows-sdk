import {
  type FlowsProperties,
  type ComponentProps,
  type Placement,
  type HintProps as LibraryHintProps,
} from "@flows/shared";
import { html, LitElement, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { defineBaseHint } from "../internal-components/base-hint";
import { Button } from "../internal-components/button";

export type HintProps = ComponentProps<LibraryHintProps>;

defineBaseHint();

export class Hint extends LitElement implements HintProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: String })
  continueText?: string;

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
  close: () => void;

  __flows: FlowsProperties;

  createRenderRoot(): this {
    return this;
  }

  render(): TemplateResult {
    const buttons: TemplateResult[] = [];
    if (this.continueText)
      buttons.push(
        Button({ variant: "primary", onClick: this.continue, children: this.continueText }),
      );

    return html`<flows-base-hint
      .title=${this.title}
      .body=${this.body}
      .targetElement=${this.targetElement}
      .placement=${this.placement}
      .offsetX=${this.offsetX}
      .offsetY=${this.offsetY}
      .onClose=${this.showCloseButton ? this.close : undefined}
      .buttons=${buttons}
    ></flows-base-hint>`;
  }
}
