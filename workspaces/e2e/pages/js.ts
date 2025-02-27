import {
  init,
  addFloatingBlocksChangeListener,
  resetAllWorkflowsProgress,
  resetWorkflowProgress,
} from "@flows/js";
import { Component, render, updateSlotComponents } from "@flows/js-components";
import * as _components from "@flows/js-components/components";
import * as _tourComponents from "@flows/js-components/tour-components";
import "@flows/js-components/index.css";

const apiUrl = new URLSearchParams(window.location.search).get("apiUrl") ?? undefined;

const Card: Component<{ text: string }> = (props) => {
  const card = document.createElement("div");
  card.className = "flows-card";
  card.style.border = "1px solid black";
  card.style.padding = "16px";
  card.style.borderRadius = "4px";

  const text = document.createElement("p");
  card.appendChild(text);
  text.textContent = props.text;

  const keyText = document.createElement("p");
  card.appendChild(keyText);
  keyText.textContent = `key: ${props.__flows.key}`;

  return {
    cleanup: () => {},
    element: card,
  };
};

init({
  environment: "prod",
  organizationId: "orgId",
  userId: "testUserId",
  apiUrl,
  userProperties: {
    email: "test@flows.sh",
    age: 10,
  },
});

const components = { ..._components, Card };
const tourComponents = { ..._tourComponents, Card };

addFloatingBlocksChangeListener((blocks) => {
  render({ blocks, components, tourComponents });
});
updateSlotComponents({
  components,
  tourComponents,
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
