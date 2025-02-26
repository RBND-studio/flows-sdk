import {
  FlowsProvider,
  FlowsSlot,
  resetAllWorkflowsProgress,
  resetWorkflowProgress,
} from "@flows/react";
import { FC, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import * as components from "@flows/react-components";
import * as tourComponents from "@flows/react-components/tour";
import "@flows/react-components/index.css";

const apiUrl = new URLSearchParams(window.location.search).get("apiUrl") ?? undefined;

const Card: FC<{ text: string }> = (props) => (
  <div
    className="flows-card"
    style={{
      border: "1px solid black",
      padding: "16px",
      borderRadius: "4px",
    }}
  >
    <p>{props.text}</p>
  </div>
);

const BlockTrigger: FC<{
  title: string;
  trigger: () => void;
  items: { text: string; trigger?: () => void }[];
}> = (props) => (
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FlowsProvider
      organizationId="orgId"
      environment="prod"
      userId="testUserId"
      userProperties={{
        email: "test@flows.sh",
        age: 10,
      }}
      apiUrl={apiUrl}
      components={{ ...components, Card, BlockTrigger }}
      tourComponents={{ ...tourComponents, Card }}
    >
      <h1>heading 1</h1>
      <h2>Subtitle</h2>

      <FlowsSlot id="my-slot" placeholder={<p>Slot placeholder</p>} />

      <button onClick={() => resetAllWorkflowsProgress()}>resetAllWorkflowsProgress</button>
      <button onClick={() => resetWorkflowProgress("my-workflow-id")}>resetWorkflowProgress</button>
    </FlowsProvider>
  </StrictMode>,
);
