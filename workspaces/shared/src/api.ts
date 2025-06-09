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
  sendEvent: (body: EventRequest) =>
    f(`${apiUrl}/v2/sdk/events`, { method: "POST", body, version }),
});
