import { connectToWebsocketAndFetchBlocks } from "./lib/blocks";
import { config } from "./store";
import { type FlowsConfiguration } from "./types/configuration";

export const init = (configuration: FlowsConfiguration): void => {
  const apiUrl = configuration.apiUrl ?? "https://api.flows-cloud.com";
  config.value = { ...configuration, apiUrl };
  const { environment, organizationId, userId, userProperties } = configuration;

  connectToWebsocketAndFetchBlocks({ apiUrl, environment, organizationId, userId, userProperties });
};
