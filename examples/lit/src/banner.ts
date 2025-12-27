import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";

type Props = {
  title: string;
  body: string;

  close: () => void;
};

export class Banner extends LitElement implements Props {
  @property()
  title = "";

  @property()
  body = "";

  @property()
  close = () => {};

  render() {
    return html`
      <div>
        <p>${this.title}</p>
        <p>${this.body}</p>
        <div>
          <button @click=${this.close}>Close</button>
        </div>
      </div>
    `;
  }
}
