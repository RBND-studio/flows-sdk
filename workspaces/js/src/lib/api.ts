import { type EventRequest, getApi } from "@flows/shared";
import { config } from "../store";

type SendEventProps = Pick<
  EventRequest,
  "name" | "blockId" | "propertyKey" | "properties" | "workflowId"
>;

export const sendEvent = async (props: SendEventProps): Promise<void> => {
  const configuration = config.value;
  if (!configuration) return;
  const { environment, organizationId, userId, apiUrl } = configuration;
  await getApi(apiUrl).sendEvent({
    ...props,
    environment,
    organizationId,
    userId,
  });
};
