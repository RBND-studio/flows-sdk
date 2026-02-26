import { type EventRequest, getApi, log, WorkflowsResponse } from "@flows/shared";
import { config } from "../store";
import { packageAndVersion } from "./constants";

type SendEventProps = Pick<
  EventRequest,
  "name" | "blockId" | "blockKey" | "propertyKey" | "properties" | "workflowId"
>;

export const sendEvent = async (props: SendEventProps): Promise<void> => {
  const configuration = config.value;
  if (!configuration) return;
  const { environment, organizationId, userId, apiUrl } = configuration;
  await getApi(apiUrl, packageAndVersion).sendEvent({
    ...props,
    environment,
    organizationId,
    userId,
  });
};

const activatedBlockIds = new Set<string>();
export const sendActivate = async (blockId: string): Promise<void> => {
  if (activatedBlockIds.has(blockId)) return;

  activatedBlockIds.add(blockId);
  await sendEvent({ name: "block-activated", blockId });
};

/**
 * Method for fetching the available workflows for the current user from the API. Before calling this method, the `init()` method must be called first.
 * @returns A promise with an array of workflows. Only the enabled workflows are returned.
 */
export const fetchWorkflows = async (): Promise<WorkflowsResponse> => {
  const configuration = config.value;
  if (!configuration) {
    log.error("fetchWorkflows() called before init() method was called");
    return { workflows: [] };
  }

  const { environment, organizationId, userId, apiUrl } = configuration;
  return getApi(apiUrl, packageAndVersion).getWorkflows({ environment, organizationId, userId });
};
