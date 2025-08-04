import {
  ComponentProps,
  FlowsProvider,
  FlowsSlot,
  resetAllWorkflowsProgress,
  resetWorkflowProgress,
  startWorkflow,
  StateMemory as IStateMemory,
  useCurrentFloatingBlocks,
  Action as IAction,
} from "@flows/react";
import { FC, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import * as components from "@flows/react-components";
import * as tourComponents from "@flows/react-components/tour";
import "@flows/react-components/index.css";
import { LanguageOption } from "@flows/shared";

const apiUrl = new URLSearchParams(window.location.search).get("apiUrl") ?? undefined;
const noUserId = new URLSearchParams(window.location.search).get("noUserId") === "true";
const noCurrentBlocks =
  new URLSearchParams(window.location.search).get("noCurrentBlocks") === "true";
const language = new URLSearchParams(window.location.search).get("language") as LanguageOption;

const Card: FC<ComponentProps<{ text: string }>> = (props) => (
  <div
    className="flows-card"
    style={{
      border: "1px solid black",
      padding: "16px",
      borderRadius: "4px",
    }}
  >
    <p className="card-text">{props.text}</p>
    <p>key: {props.__flows.key}</p>
  </div>
);

const BlockTrigger: FC<
  ComponentProps<{
    title: string;
    trigger: () => void;
    items: { text: string; trigger?: () => void }[];
  }>
> = (props) => (
  <div className="flows-card">
    <p>{props.title}</p>
    <button onClick={props.trigger}>Trigger</button>
    <ul>
      {props.items.map((item) => (
        <li key={item.text}>
          <button onClick={item.trigger}>{item.text}</button>
        </li>
      ))}
    </ul>
  </div>
);

const StateMemory: FC<
  ComponentProps<{
    title: string;
    checked: IStateMemory;
  }>
> = (props) => (
  <div className="flows-card">
    <p>{props.title}</p>
    <p>checked: {props.checked.value.toString()}</p>
    <button onClick={() => props.checked.setValue(true)}>true</button>
    <button onClick={() => props.checked.setValue(false)}>false</button>
  </div>
);

const Action: FC<ComponentProps<{ title: string; action: IAction }>> = (props) => {
  const ActionEl = props.action.url ? "a" : "button";
  return (
    <div className="flows-card">
      <p>{props.title}</p>
      <ActionEl
        href={props.action.url}
        target={props.action.openInNew ? "_blank" : undefined}
        onClick={props.action.transition}
      >
        {props.action.label}
      </ActionEl>
    </div>
  );
};

const App: FC = () => {
  const floatingBlocks = useCurrentFloatingBlocks();

  const handleChangeLocation = () => {
    window.history.pushState({}, "", window.location.pathname + "?v=1");
  };

  return (
    <>
      <h1>heading 1</h1>
      <h2>Subtitle</h2>

      <FlowsSlot id="my-slot" placeholder={<p>Slot placeholder</p>} />

      {!noCurrentBlocks && <p className="current-blocks">{JSON.stringify(floatingBlocks)}</p>}

      <button onClick={() => resetAllWorkflowsProgress()}>resetAllWorkflowsProgress</button>
      <button onClick={() => resetWorkflowProgress("my-workflow-id")}>resetWorkflowProgress</button>
      <button onClick={() => startWorkflow("my-start-block")}>startWorkflow</button>
      <button onClick={handleChangeLocation}>changeLocation</button>
    </>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FlowsProvider
      organizationId="orgId"
      environment="prod"
      userId={noUserId ? null : "testUserId"}
      language={language}
      userProperties={{
        email: "test@flows.sh",
        age: 10,
      }}
      apiUrl={apiUrl}
      components={{ ...components, Card, BlockTrigger, StateMemory, Action }}
      tourComponents={{ ...tourComponents, Card, Action }}
    >
      <App />
    </FlowsProvider>
  </StrictMode>,
);
