import { getApi } from "@flows/shared";
import { config } from "../store";

export const sendEvent = async (props: {
  name: "transition" | "tour-update";
  blockId: string;
  propertyKey?: string;
  properties?: Record<string, unknown>;
}): Promise<void> => {
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
