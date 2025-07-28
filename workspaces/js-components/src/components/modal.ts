import { type ComponentProps, type FlowsProperties } from "@flows/shared";
import { html, LitElement, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { defineBaseModal } from "../internal-components/base-modal";

export type ModalProps = ComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  showCloseButton: boolean;
  hideOverlay: boolean;

  continue: () => void;
  close: () => void;
}>;

// export const Modal: Component<ModalProps> = (props) => {
//   const buttons: HTMLElement[] = [];

//   let continueButton: HTMLButtonElement | null = null;
//   if (props.continueText) {
//     continueButton = document.createElement("button");
//     buttons.push(continueButton);
//     continueButton.className = "flows_button flows_button_primary";
//     continueButton.textContent = props.continueText;
//     continueButton.addEventListener("click", props.continue);
//   }

//   const result = BaseModal({
//     title: props.title,
//     body: props.body,
//     overlay: !props.hideOverlay,
//     buttons,
//     close: props.showCloseButton ? props.close : undefined,
//   });

//   return {
//     element: result.element,
//     cleanup: () => {
//       continueButton?.removeEventListener("click", props.continue);

//       result.cleanup();
//     },
//   };
// };

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
    defineBaseModal();

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

    console.log(
      "rendering modal",
      this.title,
      this.body,
      this.continueText,
      this.showCloseButton,
      this.hideOverlay,
    );

    return html`<flows-base-modal
      ?overlay=${!this.hideOverlay}
      title=${this.title}
      body=${this.body}
      .buttons=${buttons}
      .close=${this.showCloseButton ? this.close : undefined}
    />`;
  }
}
