import { FlowsProvider, FlowsSlot, resetAllProgress, resetWorkflowProgress } from "@flows/react";
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
      components={{ ...components, Card }}
      tourComponents={{ ...tourComponents, Card }}
    >
      <h1>heading 1</h1>
      <h2>Subtitle</h2>

      <FlowsSlot id="my-slot" placeholder={<p>Slot placeholder</p>} />

      <button onClick={() => resetAllProgress()}>resetAllProgress</button>
      <button onClick={() => resetWorkflowProgress("my-workflow-id")}>resetWorkflowProgress</button>
    </FlowsProvider>
  </StrictMode>,
);
