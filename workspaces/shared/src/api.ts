import { enqueueEvent } from "./event-queue";
import { log } from "./log";
import type { CustomFetch } from "./types";
import { type Block } from "./types";
import type { ApiSurveyAnswer } from "./types/api-survey";

const getFetch =
  (ctx: { customFetch?: CustomFetch; baseUrl: string }) =>
  <T>(
    url: string,
    { body, method, version }: { method?: string; body?: unknown; version: string },
  ): Promise<T> => {
    const fetchFn = ctx.customFetch ?? fetch;

    return fetchFn(new URL(url, ctx.baseUrl).toString(), {
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
  };

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
  free_org?: boolean;
}

export interface BlocksResponse {
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
    | "tour-session-heartbeat"
    | "tour-session-hint"
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

// API

export type ApiContext = {
  apiUrl: string;
  version: string;
  customFetch?: CustomFetch;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
export const getApi = ({ apiUrl, version, customFetch }: ApiContext) => {
  const f = getFetch({ customFetch, baseUrl: apiUrl });
  return {
    getBlocks: (body: GetBlocksRequest) =>
      f<BlocksResponse>("/v2/sdk/blocks", { method: "POST", body, version }),
    getWorkflows: (body: WorkflowsRequest) =>
      f<WorkflowsResponse>("/v2/sdk/workflows", { method: "POST", body, version }),
    sendEvent: (body: EventRequest) => f("/v2/sdk/events", { method: "POST", body, version }),
    sendEventBeacon: (body: EventRequest) =>
      navigator.sendBeacon(`${apiUrl}/v2/sdk/events/text`, JSON.stringify(body)),
    postSurvey: (body: ApiSurveyAnswer) => f("/v2/sdk/survey", { method: "POST", body, version }),
  };
};

export type GetBlocksProps = Omit<GetBlocksRequest, "userId" | "environment" | "organizationId">;
export type SendEventProps = Omit<EventRequest, "userId" | "environment" | "organizationId">;
export type PostSurveyProps = Omit<
  ApiSurveyAnswer,
  "userId" | "environment" | "organizationId" | "url"
>;

export const createBoundApi = (
  getContext: () =>
    | (ApiContext & { environment: string; organizationId: string; userId: string })
    | null,
) => {
  const activatedBlockIds = new Set<string>();

  const sendEvent = (props: SendEventProps): Promise<void> => {
    const ctx = getContext();
    if (!ctx) {
      log.error("One of the methods was called before SDK initialization.");
      return Promise.resolve();
    }
    return enqueueEvent({ apiContext: ctx, event: { ...props, ...ctx } });
  };

  return {
    blockUpdatesWebsocketUrl: (): string => {
      const ctx = getContext();
      if (!ctx) throw new Error("Invalid blockUpdatesWebsocketUrl() call");
      const baseUrl = ctx.apiUrl.replace(/^http(s?):\/\//, "ws$1://");
      return `${baseUrl}/ws/sdk/block-updates?${new URLSearchParams({
        environment: ctx.environment,
        organizationId: ctx.organizationId,
        userId: ctx.userId,
      }).toString()}`;
    },
    getBlocks: (props: GetBlocksProps): Promise<BlocksResponse> => {
      const ctx = getContext();
      if (!ctx) throw new Error("Invalid getBlocks() call");
      return getApi(ctx).getBlocks({ ...props, ...ctx });
    },
    sendEvent,
    /**
     * @deprecated Use `sendEvent` instead, which will queue the event and retry sending it if it fails. This method can be used only with time sensitive events that don't need to be retried, e.g. tour session update.
     */
    sendEventImmediately: async (props: SendEventProps): Promise<void> => {
      const ctx = getContext();
      if (!ctx) return Promise.resolve();
      await getApi(ctx).sendEvent({ ...props, ...ctx });
    },
    sendEventBeacon: (props: SendEventProps): void => {
      const ctx = getContext();
      if (!ctx) return;
      getApi(ctx).sendEventBeacon({ ...props, ...ctx });
    },
    postSurvey: async (props: PostSurveyProps): Promise<void> => {
      const ctx = getContext();
      if (!ctx) return Promise.resolve();
      await getApi(ctx).postSurvey({ ...props, ...ctx, url: window.location.href });
    },
    sendActivate: (blockId: string): Promise<void> => {
      if (activatedBlockIds.has(blockId)) return Promise.resolve();
      activatedBlockIds.add(blockId);
      return sendEvent({ name: "block-activated", blockId });
    },
    fetchWorkflows: async (): Promise<WorkflowsResponse> => {
      const ctx = getContext();
      if (!ctx) {
        log.error("fetchWorkflows() called before SDK initialization");
        return { workflows: [] };
      }
      return getApi(ctx).getWorkflows(ctx);
    },
  };
};
