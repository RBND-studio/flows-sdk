import {
  type ComponentProps,
  type FlowsProperties,
  type ModalProps as LibraryModalProps,
} from "@flows/shared";
import { html, LitElement, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { BaseModal } from "../internal-components/base-modal";

export type ModalProps = ComponentProps<LibraryModalProps>;

export class Modal extends LitElement implements ModalProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: String })
  continueText?: string;

  @property({ type: Boolean })
  showCloseButton: boolean;

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

  render(): unknown {
    const buttons: TemplateResult[] = [];

    if (this.continueText) {
      const continueButton = html`<button
        @click=${this.continue}
        class="flows_button flows_button_primary"
      >
        ${this.continueText}
      </button>`;
      buttons.push(continueButton);
    }

    return BaseModal({
      title: this.title,
      body: this.body,
      overlay: !this.hideOverlay,
      buttons,
      close: this.showCloseButton ? this.close : undefined,
    });
  }
}
