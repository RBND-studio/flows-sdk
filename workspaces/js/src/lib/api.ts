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

export const fetchWorkflows = async (): Promise<WorkflowsResponse> => {
  const configuration = config.value;
  if (!configuration) {
    log.error("fetchWorkflows() called before rendering <FlowsProvider>");
    return { workflows: [] };
  }

  const { environment, organizationId, userId, apiUrl } = configuration;
  return getApi(apiUrl, packageAndVersion).getWorkflows({ environment, organizationId, userId });
};
