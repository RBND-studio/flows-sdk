import {
  applyUpdateMessageToBlocksState,
  getBlockUpdatesWebsocketUrl,
  getUserLanguage,
  log,
  parseWebsocketMessage,
} from "@flows/shared";
import {
  blocks,
  blocksError,
  config,
  freeOrg,
  pendingMessages,
  tourConcurrency,
  updateBlocks,
} from "../store";
import { type Disconnect, websocket } from "./websocket";
import { api } from "./api";

let disconnect: Disconnect | null = null;

type Props = {
  onAfterLoad: () => void;
};

export const connectToWebsocketAndFetchBlocks = ({ onAfterLoad }: Props): void => {
  const configuration = config.value;
  if (!configuration) return;

  const { apiUrl, environment, organizationId, userId } = configuration;
  const wsUrl = getBlockUpdatesWebsocketUrl({
    apiUrl,
    environment,
    organizationId,
    userId,
  });
  if (!wsUrl) {
    // This should never happen, the url will be undefined only if userId is missing, which is a required parameter for the init function
    throw new Error("Couldn't connect to Flows: Missing userId");
  }

  const fetchBlocks = (): void => {
    blocksError.value = false;
    void api
      .getBlocks({
        language: getUserLanguage(configuration.language),
        userProperties: configuration.userProperties,
      })
      .then((res) => {
        const blocksWithUpdates = pendingMessages.value.reduce(
          applyUpdateMessageToBlocksState,
          res.blocks,
        );
        updateBlocks(blocksWithUpdates);
        pendingMessages.value = [];

        // Disconnect if the user is usage limited
        if (res.meta?.usage_limited) disconnect?.();
        freeOrg.value = !!res.meta?.free_org;
        tourConcurrency.value = !!res.meta?.tour_concurrency;
        onAfterLoad();
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
      if (!blocks.value) pendingMessages.value = [...pendingMessages.value, data];
      else updateBlocks(applyUpdateMessageToBlocksState(blocks.value ?? [], data));
    }
  };

  // Disconnect previous connection if it exists
  disconnect?.();

  const websocketResult = websocket({ url: wsUrl, onMessage, onOpen: fetchBlocks });
  disconnect = websocketResult.disconnect;
};
