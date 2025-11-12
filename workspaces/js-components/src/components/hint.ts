import {
  type FlowsProperties,
  type ComponentProps,
  type Placement,
  type HintProps as LibraryHintProps,
  type Action,
} from "@flows/shared";
import { html, LitElement, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { defineBaseHint } from "../internal-components/base-hint";

export type HintProps = ComponentProps<LibraryHintProps>;

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

  @property({ type: Function })
  continue: () => void;

  @property({ type: Function })
  close: () => void;

  __flows: FlowsProperties;

  createRenderRoot(): this {
    return this;
  }

  render(): TemplateResult {
    return html`<flows-base-hint
      .title=${this.title}
      .body=${this.body}
      .targetElement=${this.targetElement}
      .placement=${this.placement}
      .offsetX=${this.offsetX}
      .offsetY=${this.offsetY}
      .onClose=${this.dismissible ? this.close : undefined}
      .primaryButton=${this.primaryButton}
      .secondaryButton=${this.secondaryButton}
    ></flows-base-hint>`;
  }
}

export const BasicsV2Hint = Hint;
