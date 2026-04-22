import { getApi, log, type WorkflowsResponse, type EventRequest } from "@flows/shared";
import { globalConfig } from "./store";
import { packageAndVersion } from "./constants";
import type { ApiSurveyAnswer } from "@flows/shared";

type SendEventProps = Omit<EventRequest, "userId" | "environment" | "organizationId">;

export const sendEvent = async (props: SendEventProps): Promise<void> => {
  const { apiUrl, environment, organizationId, userId, apiFactory } = globalConfig;
  if (!apiUrl || !environment || !organizationId || !userId) return;
  const api = apiFactory ? apiFactory(apiUrl, packageAndVersion) : getApi(apiUrl, packageAndVersion);

  await api.sendEvent({
    ...props,
    environment,
    organizationId,
    userId,
  });
};

export const postSurvey = async (
  props: Omit<ApiSurveyAnswer, "userId" | "environment" | "organizationId" | "url">,
) => {
  const { apiUrl, environment, organizationId, userId, apiFactory } = globalConfig;
  if (!apiUrl || !environment || !organizationId || !userId) return;
  const api = apiFactory ? apiFactory(apiUrl, packageAndVersion) : getApi(apiUrl, packageAndVersion);
  await api.postSurvey({
    ...props,
    environment,
    organizationId,
    userId,
    url: window.location.href,
  });
};

const activatedBlockIds = new Set<string>();
export const sendActivate = async (blockId: string): Promise<void> => {
  if (activatedBlockIds.has(blockId)) return;

  activatedBlockIds.add(blockId);
  await sendEvent({ name: "block-activated", blockId });
};

/**
 * Returns all available workflows for the current user. Before calling this method, the `<FlowsProvider>` component must be rendered.
 * @returns A promise resolving to a {@link WorkflowsResponse} object containing an array of enabled workflows.
 */
export const fetchWorkflows = async (): Promise<WorkflowsResponse> => {
  const { apiUrl, environment, organizationId, userId, apiFactory } = globalConfig;
  if (!apiUrl || !environment || !organizationId || !userId) {
    log.error("fetchWorkflows() called before rendering <FlowsProvider>");
    return { workflows: [] };
  }

  const api = apiFactory ? apiFactory(apiUrl, packageAndVersion) : getApi(apiUrl, packageAndVersion);
  return api.getWorkflows({ environment, organizationId, userId });
};
