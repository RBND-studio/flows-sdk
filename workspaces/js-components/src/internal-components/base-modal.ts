import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { close16 } from "../icons/close-16";
import { type _Component } from "../types";

interface Props {
  title: string;
  body: string;
  overlay: boolean;
  buttons: unknown[];
  close?: () => void;
}

const tagName = "flows-base-modal";
class BaseModal extends LitElement implements Props {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: Boolean })
  overlay: boolean;

  @property({ attribute: false })
  buttons: unknown[];

  @property({ attribute: false })
  close?: () => void;

  createRenderRoot(): this {
    return this;
  }

  render(): unknown {
    const overlay = this.overlay
      ? html`<div
          class="flows_modal_overlay ${this.close ? "flows_modal_clickable" : ""}"
          @click=${this.close}
          aria-hidden="true"
        ></div>`
      : null;

    return html`
      ${overlay}
      <div class="flows_modal_wrapper">
        <div class="flows_modal_modal">
          <p class="flows_text flows_text_title">${this.title}</p>
          <p class="flows_text flows_text_body">${unsafeHTML(this.body)}</p>

          ${this.buttons.length
            ? html`<div class="flows_modal_footer">${this.buttons.map((button) => button)}</div>`
            : null}
          ${this.close
            ? html`<button
                class="flows_iconButton flows_modal_close"
                aria-label="Close"
                @click=${this.close}
              >
                ${close16()}
              </button>`
            : null}
        </div>
      </div>
    `;
  }
}

export const defineBaseModal = (): void => {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, BaseModal);
  }
};
