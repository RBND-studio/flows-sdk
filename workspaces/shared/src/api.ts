import { type Block } from "./types";

const f = <T>(
  url: string,
  { body, method }: { method?: string; body?: unknown } = {},
): Promise<T> =>
  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
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
}

interface BlocksResponse {
  blocks: Block[];
}

interface EventRequest {
  userId: string;
  environment: string;
  organizationId: string;
  name: string;
  blockId: string;
  propertyKey?: string;
  properties?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
export const getApi = (apiUrl: string) => ({
  getBlocks: (body: GetBlocksRequest) =>
    f<BlocksResponse>(`${apiUrl}/v2/sdk/blocks`, { method: "POST", body }),
  sendEvent: (body: EventRequest) => f(`${apiUrl}/v2/sdk/events`, { method: "POST", body }),
});
