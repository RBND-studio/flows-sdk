import { type Block } from "./types";

const f = <T>(
  url: string,
  { body, method, version }: { method?: string; body?: unknown; version: string },
): Promise<T> =>
  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-flows-version": version,
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    const text = await res.text();
    const resBody = (text ? JSON.parse(text) : undefined) as T;
    if (!res.ok) {
      const errorBody = resBody as undefined | { message?: string };
      throw new Error(errorBody?.message ?? res.statusText);
    }
    return resBody;
  });

// POST /v2/sdk/blocks

interface GetBlocksRequest {
  userId: string;
  environment: string;
  organizationId: string;
  userProperties?: Record<string, unknown>;
  language?: string;
}

interface BlockResponseMeta {
  usage_limited?: boolean;
}

interface BlocksResponse {
  blocks: Block[];
  meta?: BlockResponseMeta;
}

// POST /v2/sdk/workflows

export interface WorkflowsRequest {
  userId: string;
  environment: string;
  organizationId: string;
}

export type WorkflowStatus = "enabled" | "launchpad-enabled";
export type WorkflowFrequency = "once" | "every-time";

export type WorkflowUserState = "not-started" | "in-progress" | "completed" | "stopped";

export interface Workflow {
  /**
   * UUID of the workflow. You can find it in the Flows app in the workflow detail by opening the three dot menu.
   */
  id: string;
  /**
   * How the workflow is currently enabled in Flows. Can be either:
   * - `enabled`: The workflow is published and active.
   * - `launchpad-enabled`: The workflow is published, active, and inside an active launchpad group.
   */
  workflow_status: WorkflowStatus;
  /**
   * How often the workflow can be shown to the user. Can be either:
   * - `once`: The workflow can only be entered once.
   * - `every-time`: The workflow can be entered every time.
   */
  frequency: WorkflowFrequency;
  /**
   * The user's current state in the workflow. Can be either:
   * - `not-started`: The user has not entered the workflow.
   * - `in-progress`: The user is currently in the workflow.
   * - `completed`: The user has completed the workflow.
   * - `stopped`: The user has been stopped the workflow (e.g., by a workflow migration).
   */
  user_state: WorkflowUserState;
  /**
   * ISO string of when the user entered the workflow.
   */
  entered_at?: string;
  /**
   * ISO string of when the user exited the workflow.
   */
  exited_at?: string;
}

export interface WorkflowsResponse {
  workflows: Workflow[];
}

// POST /v2/sdk/events

export interface EventRequest {
  userId: string;
  environment: string;
  organizationId: string;
  name:
    | "transition"
    | "tour-update"
    | "reset-progress"
    | "workflow-start"
    | "set-state-memory"
    | "block-activated";
  workflowId?: string;
  blockId?: string;
  blockKey?: string;
  propertyKey?: string;
  properties?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
export const getApi = (apiUrl: string, version: string) => ({
  getBlocks: (body: GetBlocksRequest) =>
    f<BlocksResponse>(`${apiUrl}/v2/sdk/blocks`, { method: "POST", body, version }),
  getWorkflows: (body: WorkflowsRequest) =>
    f<WorkflowsResponse>(`${apiUrl}/v2/sdk/workflows`, { method: "POST", body, version }),
  sendEvent: (body: EventRequest) =>
    f(`${apiUrl}/v2/sdk/events`, { method: "POST", body, version }),
});
