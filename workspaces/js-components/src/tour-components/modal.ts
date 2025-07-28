import { type TourComponentProps, type FlowsProperties } from "@flows/shared";
import { LitElement, type TemplateResult, html } from "lit";
import { property } from "lit/decorators.js";
import { defineBaseModal } from "../internal-components/base-modal";

export type ModalProps = TourComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  previousText?: string;
  showCloseButton: boolean;
  hideOverlay: boolean;
}>;

export class Modal extends LitElement implements ModalProps {
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

  render(): unknown {
    defineBaseModal();

    const buttons: TemplateResult[] = [];

    if (this.previous && this.previousText) {
      const previousButton = html`<button
        class="flows_button flows_button_secondary"
        @click=${this.previous}
      >
        ${this.previousText}
      </button>`;
      buttons.push(previousButton);
    }

    if (this.continueText) {
      const continueButton = html`<button
        @click=${this.continue}
        class="flows_button flows_button_primary"
      >
        ${this.continueText}
      </button>`;
      buttons.push(continueButton);
    }

    return html`<flows-base-modal
      ?overlay=${!this.hideOverlay}
      title=${this.title}
      body=${this.body}
      .buttons=${buttons}
      .close=${this.showCloseButton ? this.cancel : undefined}
    />`;
  }
}
