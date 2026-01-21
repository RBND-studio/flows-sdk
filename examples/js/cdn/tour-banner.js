import { LitElement, html } from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";

export class TourBanner extends LitElement {
  title = "";
  body = "";

  previous = () => {};
  continue = () => {};
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

        <!-- In the first step the previous function is undefined -->
        ${!!this.previous && html`<button @click=${this.previous}>Previous</button>`}
        <button @click=${this.continue}>Continue</button>
        <button @click=${this.cancel}>Cancel</button>
      </div>
    `;
  }
}
