import type { FlowsProperties, TourComponentProps } from "@flows/js";
import { html, LitElement } from "lit";

type Props = TourComponentProps<{
  title: string;
  body: string;
}>;

export class TourBanner extends LitElement implements Props {
  title = "";

  body = "";

  previous?: () => void;
  continue: () => void;
  cancel: () => void;

  __flows: FlowsProperties;

  render() {
    return html`
      <div>
        <p>${this.title}</p>
        <p>${this.body}</p>
        <div>
          <!-- In the first step the previous function is undefined -->
          ${this.previous && html`<button @click=${this.previous}>Previous</button>`}
          <button @click=${this.continue}>Continue</button>
          <button @click=${this.cancel}>Cancel</button>
        </div>
      </div>
    `;
  }
}
