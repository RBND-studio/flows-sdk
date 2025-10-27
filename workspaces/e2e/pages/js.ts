import {
  init,
  addFloatingBlocksChangeListener,
  resetAllWorkflowsProgress,
  resetWorkflowProgress,
  Action as IAction,
} from "@flows/js";
import { Component, render, updateSlotComponents } from "@flows/js-components";
import * as _components from "@flows/js-components/components";
import * as _tourComponents from "@flows/js-components/tour-components";
import "@flows/js-components/index.css";
import { startWorkflow, StateMemory as IStateMemory } from "@flows/js";
import { LanguageOption } from "@flows/shared";

const apiUrl = new URLSearchParams(window.location.search).get("apiUrl") ?? undefined;
const noCurrentBlocks =
  new URLSearchParams(window.location.search).get("noCurrentBlocks") === "true";
const language = new URLSearchParams(window.location.search).get("language") as LanguageOption;
const organizationId = new URLSearchParams(window.location.search).get("organizationId");

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

const StateMemory: Component<{ title: string; checked: IStateMemory }> = (props) => {
  const card = document.createElement("div");
  card.className = "flows-card";

  const title = document.createElement("p");
  card.appendChild(title);
  title.textContent = props.title;

  const checkedText = document.createElement("p");
  card.appendChild(checkedText);
  checkedText.textContent = `checked: ${props.checked.value}`;

  const handleTrue = () => props.checked.setValue(true);
  const trueButton = document.createElement("button");
  card.appendChild(trueButton);
  trueButton.textContent = "true";
  trueButton.addEventListener("click", handleTrue);

  const handleFalse = () => props.checked.setValue(false);
  const falseButton = document.createElement("button");
  card.appendChild(falseButton);
  falseButton.textContent = "false";
  falseButton.addEventListener("click", handleFalse);

  return {
    cleanup: () => {
      trueButton.removeEventListener("click", handleTrue);
      falseButton.removeEventListener("click", handleFalse);
    },
    element: card,
  };
};

const Action: Component<{ title: string; action: IAction }> = (props) => {
  const card = document.createElement("div");
  card.className = "flows-card";

  const title = document.createElement("p");
  card.appendChild(title);
  title.textContent = props.title;

  const ActionEl = props.action.url ? "a" : "button";
  const actionElement = document.createElement(ActionEl);
  actionElement.textContent = props.action.label;
  if (props.action.url) (actionElement as HTMLAnchorElement).href = props.action.url;
  if (props.action.openInNew) (actionElement as HTMLAnchorElement).target = "_blank";
  if (props.action.callAction) actionElement.addEventListener("click", props.action.callAction);

  card.appendChild(actionElement);

  return {
    cleanup: () => {
      if (props.action.callAction)
        actionElement.removeEventListener("click", props.action.callAction);
    },
    element: card,
  };
};

init({
  environment: "prod",
  organizationId: organizationId ?? "orgId",
  userId: "testUserId",
  language,
  apiUrl,
  userProperties: {
    email: "test@flows.sh",
    age: 10,
  },
});

const components = { ..._components, Card, BlockTrigger, StateMemory, Action };
const tourComponents = { ..._tourComponents, Card, Action };

addFloatingBlocksChangeListener((blocks) => {
  render({ blocks, components, tourComponents });

  if (!noCurrentBlocks)
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
(document.querySelector("#startWorkflow") as HTMLButtonElement).addEventListener("click", () => {
  startWorkflow("my-start-block");
});
(document.querySelector("#changeLocation") as HTMLButtonElement).addEventListener("click", () => {
  window.history.pushState({}, "", window.location.pathname + "?v=1");
});
