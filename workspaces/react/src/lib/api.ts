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
