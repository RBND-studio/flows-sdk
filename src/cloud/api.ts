import type { Flow } from "../types";

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
    return resBody;
  });

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- not needed
export const api = (baseUrl: string) => ({
  sendEvent: (body: {
    eventTime: string;
    type: string;
    userHash?: string;
    flowId: string;
    projectId: string;
    stepIndex?: string;
    stepHash?: string;
    flowHash: string;
  }): Promise<void> =>
    f(`${baseUrl}/sdk/events`, {
      method: "POST",
      body,
    }),
  getFlows: ({ projectId, userHash }: { projectId: string; userHash?: string }): Promise<Flow[]> =>
    f(`${baseUrl}/sdk/flows?projectId=${projectId}${userHash ? `&userHash=${userHash}` : ""}`),
  getPreviewFlow: ({ flowId, projectId }: { projectId: string; flowId: string }): Promise<Flow> =>
    f(`${baseUrl}/sdk/flows/${flowId}?projectId=${projectId}`),
});
