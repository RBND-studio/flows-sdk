import {
  applyUpdateMessageToBlocksState,
  getApi,
  getUserLanguage,
  log,
  parseWebsocketMessage,
} from "@flows/shared";
import { blocks, blocksError, blocksState, config, pendingMessages } from "../store";
import { type Disconnect, websocket } from "./websocket";
import { packageAndVersion } from "./constants";

let disconnect: Disconnect | null = null;

export const connectToWebsocketAndFetchBlocks = (): void => {
  const configuration = config.value;
  if (!configuration) return;

  const { environment, organizationId, userId, apiUrl, customFetch } = configuration;
  const params = { environment, organizationId, userId };
  const wsUrl = (() => {
    const wsBase = apiUrl.replace("https://", "wss://").replace("http://", "ws://");
    return `${wsBase}/ws/sdk/block-updates?${new URLSearchParams(params).toString()}`;
  })();

  const fetchBlocks = (): void => {
    blocksError.value = false;
    void getApi({ apiUrl, version: packageAndVersion, customFetch })
      .getBlocks({
        ...params,
        language: getUserLanguage(configuration.language),
        userProperties: configuration.userProperties,
      })
      .then((res) => {
        const blocksWithUpdates = pendingMessages.value.reduce(
          applyUpdateMessageToBlocksState,
          res.blocks,
        );
        blocksState.value = blocksWithUpdates;
        pendingMessages.value = [];

        // Disconnect if the user is usage limited
        if (res.meta?.usage_limited) disconnect?.();
      })
      .catch((err: unknown) => {
        blocksError.value = true;
        log.error("Failed to load blocks", err);
      });
  };
  const onMessage = (event: MessageEvent<unknown>): void => {
    const data = parseWebsocketMessage(event);
    if (!data) return;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- there will be more message types in the future
    if (data.type === "block-updates") {
      if (!blocksState.value) pendingMessages.value = [...pendingMessages.value, data];
      else blocksState.value = applyUpdateMessageToBlocksState(blocks.value, data);
    }
  };

  // Disconnect previous connection if it exists
  disconnect?.();

  const websocketResult = websocket({ url: wsUrl, onMessage, onOpen: fetchBlocks });
  disconnect = websocketResult.disconnect;
};
