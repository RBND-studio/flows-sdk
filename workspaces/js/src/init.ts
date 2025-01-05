import { connectToWebsocketAndFetchBlocks } from "./lib/blocks";
import { config, pathname } from "./store";
import { type FlowsConfiguration } from "./types/configuration";

let locationChangeInterval: number | null = null;

export const init = (configuration: FlowsConfiguration): void => {
  const apiUrl = configuration.apiUrl ?? "https://api.flows-cloud.com";
  config.value = { ...configuration, apiUrl };
  const { environment, organizationId, userId, userProperties } = configuration;

  connectToWebsocketAndFetchBlocks({ apiUrl, environment, organizationId, userId, userProperties });

  if (locationChangeInterval !== null) clearInterval(locationChangeInterval);
  locationChangeInterval = window.setInterval(() => {
    if (pathname.value !== window.location.pathname) {
      pathname.value = window.location.pathname;
    }
  }, 250);
};
