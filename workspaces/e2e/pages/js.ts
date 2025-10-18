import {
  init,
  resetAllWorkflowsProgress,
  resetWorkflowProgress,
  Action as IAction,
  addFloatingBlocksChangeListener,
} from "@flows/js";
import { setupJsComponents } from "@flows/js-components";
import * as _components from "@flows/js-components/components";
import * as _tourComponents from "@flows/js-components/tour-components";
import "@flows/js-components/index.css";
import { startWorkflow, StateMemory as IStateMemory } from "@flows/js";
import { LanguageOption } from "@flows/shared";
import { css, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { FlowsProperties } from "@flows/js";
import { html, unsafeStatic } from "lit/static-html.js";

const apiUrl = new URLSearchParams(window.location.search).get("apiUrl") ?? undefined;
const noCurrentBlocks =
  new URLSearchParams(window.location.search).get("noCurrentBlocks") === "true";
const language = new URLSearchParams(window.location.search).get("language") as LanguageOption;

class Card extends LitElement {
  @property({ type: String })
  text: string;

  __flows: FlowsProperties;

  static styles = css`
    .flows-card {
      border: 1px solid black;
      padding: 16px;
      border-radius: 4px;
    }
  `;

  render() {
    return html`<div class="flows-card">
      <p class="card-text">${this.text}</p>
      <p>key: ${this.__flows.key}</p>
    </div>`;
  }
}

class BlockTrigger extends LitElement {
  @property({ type: String })
  title: string;

  @property({ type: Array })
  items: { text: string; trigger?: () => void }[];

  @property({ type: Function })
  trigger: () => void;

  render() {
    return html`<div class="flows-card">
      <p>${this.title}</p>
      <button @click=${this.trigger}>Trigger</button>
      <ul>
        ${this.items.map(
          (item) =>
            html`<li>
              <button @click=${item.trigger}>${item.text}</button>
            </li>`,
        )}
      </ul>
    </div>`;
  }
}

class StateMemory extends LitElement {
  @property({ type: String })
  title: string;

  @property({ type: Object })
  checked: IStateMemory;

  render() {
    return html`<div class="flows-card">
      <p>${this.title}</p>
      <p>checked: ${this.checked.value.toString()}</p>
      <button @click=${() => this.checked.setValue(true)}>true</button>
      <button @click=${() => this.checked.setValue(false)}>false</button>
    </div>`;
  }
}

class Action extends LitElement {
  @property({ type: String })
  title: string;

  @property({ type: Object })
  action: IAction;

  render() {
    const ActionEl = this.action.url ? "a" : "button";
    return html`<div class="flows-card">
      <p>${this.title}</p>
      <${unsafeStatic(ActionEl)}
        href=${this.action.url}
        target=${this.action.openInNew ? "_blank" : undefined}
        @click=${this.action.callAction}
      >
        ${this.action.label}
      </${unsafeStatic(ActionEl)}>
    </div>`;
  }
}

init({
  environment: "prod",
  organizationId: "orgId",
  userId: "testUserId",
  language,
  apiUrl,
  userProperties: {
    email: "test@flows.sh",
    age: 10,
  },
});

const components = {
  ..._components,
  Card,
  BlockTrigger,
  StateMemory,
  Action,
};
const tourComponents = {
  ..._tourComponents,
  Card,
  Action,
};

setupJsComponents({ components, tourComponents });

addFloatingBlocksChangeListener((blocks) => {
  if (!noCurrentBlocks)
    document.querySelector(".current-blocks")!.textContent = JSON.stringify(blocks);
});

(document.querySelector("#resetAllWorkflowsProgress") as HTMLButtonElement).addEventListener(
  "click",
  () => {
    resetAllWorkflowsProgress();
  },
);
(document.querySelector("#resetWorkflowProgress") as HTMLButtonElement).addEventListener(
  "click",
  () => {
    resetWorkflowProgress("my-workflow-id");
  },
);
(document.querySelector("#startWorkflow") as HTMLButtonElement).addEventListener("click", () => {
  startWorkflow("my-start-block");
});
(document.querySelector("#changeLocation") as HTMLButtonElement).addEventListener("click", () => {
  window.history.pushState({}, "", window.location.pathname + "?v=1");
});
