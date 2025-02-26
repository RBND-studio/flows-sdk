import { getApi, type EventRequest } from "@flows/shared";
import { globalConfig } from "./store";

type SendEventProps = Pick<
  EventRequest,
  "name" | "blockId" | "propertyKey" | "properties" | "workflowId"
>;

export const sendEvent = async (props: SendEventProps): Promise<void> => {
  const { apiUrl, environment, organizationId, userId } = globalConfig;
  if (!apiUrl || !environment || !organizationId || !userId) return;
  await getApi(apiUrl).sendEvent({
    ...props,
    environment,
    organizationId,
    userId,
  });
};
