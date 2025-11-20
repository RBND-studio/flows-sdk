import { LitElement, html } from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";

export class Banner extends LitElement {
  title = "";
  body = "";

  close = () => {};

  // Disable shadow DOM
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div>
        <h2>${this.title}</h2>
        <p>${this.body}</p>

        <button @click=${this.close}>Close</button>
      </div>
    `;
  }
}
