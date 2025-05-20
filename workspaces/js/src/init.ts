import { handleDocumentClick } from "./lib/click";
import { connectToWebsocketAndFetchBlocks } from "./lib/blocks";
import { addHandlers } from "./lib/handler";
import { config, pathname } from "./store";
import { type FlowsOptions } from "./types/configuration";

let locationChangeInterval: number | null = null;

/**
 * Identify the user and initialize `@flows/js`.
 *
 * @param options - The configuration options for Flows
 */
export const init = (options: FlowsOptions): void => {
  const apiUrl = options.apiUrl ?? "https://api.flows-cloud.com";
  config.value = { ...options, apiUrl };
  const { environment, organizationId, userId, userProperties, locale } = options;

  connectToWebsocketAndFetchBlocks({
    apiUrl,
    environment,
    organizationId,
    userId,
    userProperties,
    locale,
  });

  if (locationChangeInterval !== null) clearInterval(locationChangeInterval);
  locationChangeInterval = window.setInterval(() => {
    if (pathname.value !== window.location.pathname) {
      pathname.value = window.location.pathname;
    }
  }, 250);

  addHandlers([{ type: "click", handler: handleDocumentClick }]);
};
