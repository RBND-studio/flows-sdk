import { LitElement, html } from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";

export class TourBanner extends LitElement {
  title = "";
  body = "";

  continue = () => {};
  previous = () => {};
  cancel = () => {};

  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div>
        <h2>${this.title}</h2>
        <p>${this.body}</p>

        <button @click=${this.previous}>Previous</button>
        <button @click=${this.continue}>Continue</button>
        <button @click=${this.cancel}>Cancel</button>
      </div>
    `;
  }
}
