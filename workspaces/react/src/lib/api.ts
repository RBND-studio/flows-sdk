import { getApi, log, WorkflowsResponse, type EventRequest } from "@flows/shared";
import { globalConfig } from "./store";
import { packageAndVersion } from "./constants";

type SendEventProps = Pick<
  EventRequest,
  "name" | "blockId" | "blockKey" | "propertyKey" | "properties" | "workflowId"
>;

export const sendEvent = async (props: SendEventProps): Promise<void> => {
  const { apiUrl, environment, organizationId, userId } = globalConfig;
  if (!apiUrl || !environment || !organizationId || !userId) return;
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
 * Method for fetching the available workflows for the current user from the API. Before calling this method, the `<FlowsProvider>` component must be rendered.
 * @returns A promise with an array of workflows. Only the enabled workflows are returned.
 */
export const fetchWorkflows = async (): Promise<WorkflowsResponse> => {
  const { apiUrl, environment, organizationId, userId } = globalConfig;
  if (!apiUrl || !environment || !organizationId || !userId) {
    log.error("fetchWorkflows() called before rendering <FlowsProvider>");
    return { workflows: [] };
  }

  return getApi(apiUrl, packageAndVersion).getWorkflows({ environment, organizationId, userId });
};
