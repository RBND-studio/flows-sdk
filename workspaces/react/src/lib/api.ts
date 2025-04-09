import { getApi, type EventRequest } from "@flows/shared";
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
