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
  text.classList.add("card-text");
  text.textContent = props.text;

  const keyText = document.createElement("p");
  card.appendChild(keyText);
  keyText.textContent = `key: ${props.__flows.key}`;

  return {
    cleanup: () => {},
    element: card,
  };
};

const BlockTrigger: Component<{
  title: string;
  trigger: () => void;
  items: { text: string; trigger?: () => void }[];
}> = (props) => {
  const card = document.createElement("div");
  card.className = "flows-card";

  const title = document.createElement("p");
  card.appendChild(title);
  title.textContent = props.title;

  const triggerButton = document.createElement("button");
  card.appendChild(triggerButton);
  triggerButton.textContent = "Trigger";
  triggerButton.addEventListener("click", props.trigger);

  const list = document.createElement("ul");
  card.appendChild(list);
  let listButtons: HTMLButtonElement[] = [];
  props.items.forEach((item) => {
    const listItem = document.createElement("li");
    list.appendChild(listItem);

    const button = document.createElement("button");
    listButtons.push(button);
    listItem.appendChild(button);
    button.textContent = item.text;
    if (item.trigger) button.addEventListener("click", item.trigger);
  });

  return {
    cleanup: () => {
      triggerButton.removeEventListener("click", props.trigger);
      listButtons.forEach((button, i) => {
        const trigger = props.items[i]?.trigger;
        if (trigger) button.removeEventListener("click", trigger);
      });
    },
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

const components = { ..._components, Card, BlockTrigger };
const tourComponents = { ..._tourComponents, Card };

addFloatingBlocksChangeListener((blocks) => {
  render({ blocks, components, tourComponents });

  document.querySelector(".current-blocks")!.textContent = JSON.stringify(blocks);
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
