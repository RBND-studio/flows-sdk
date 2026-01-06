import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("my-card")
export class MyCard extends LitElement {
  render() {
    return html`
      <div class="my-card">
        <p class="my-card-title">My Card title</p>
      </div>
    `;
  }

  static styles = css`
    .my-card {
      border: 1px solid black;
      padding: 16px;
      border-radius: 8px;
    }
    .my-card-title {
      font-size: 20px;
      font-weight: bold;
    }
  `;
}
