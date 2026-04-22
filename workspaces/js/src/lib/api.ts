import type { ApiSurveyAnswer, WorkflowsResponse } from "@flows/shared";
import { type EventRequest, getApi, log } from "@flows/shared";
import { config } from "../store";
import { packageAndVersion } from "./constants";

type SendEventProps = Pick<
  EventRequest,
  "name" | "blockId" | "blockKey" | "propertyKey" | "properties" | "workflowId"
>;

export const sendEvent = async (props: SendEventProps): Promise<void> => {
  const configuration = config.value;
  if (!configuration) return;
  const { environment, organizationId, userId, apiUrl, apiFactory } = configuration;
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
  const configuration = config.value;
  if (!configuration) return;
  const { apiUrl, environment, organizationId, userId, apiFactory } = configuration;
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
 * Returns all available workflows for the current user. Before calling this method, the `init()` method must be called first.
 * @returns A promise resolving to a {@link WorkflowsResponse} object containing an array of enabled workflows.
 */
export const fetchWorkflows = async (): Promise<WorkflowsResponse> => {
  const configuration = config.value;
  if (!configuration) {
    log.error("fetchWorkflows() called before init() method was called");
    return { workflows: [] };
  }

  const { environment, organizationId, userId, apiUrl, apiFactory } = configuration;
  const api = apiFactory ? apiFactory(apiUrl, packageAndVersion) : getApi(apiUrl, packageAndVersion);

  return api.getWorkflows({ environment, organizationId, userId });
};
