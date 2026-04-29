import {
  applyUpdateMessageToBlocksState,
  getApi,
  getUserLanguage,
  type LanguageOption,
  log,
  parseWebsocketMessage,
  type UserProperties,
  type ApiFactory,
  type BlockUpdatesMessage,
} from "@flows/shared";
import { blocks, blocksError, blocksState, pendingMessages } from "../store";
import { type Disconnect, websocket } from "./websocket";
import { packageAndVersion } from "./constants";

interface Props {
  apiUrl: string;
  apiFactory?: ApiFactory;
  environment: string;
  organizationId: string;
  userId: string;
  userProperties?: UserProperties;
  language?: LanguageOption;
}

let disconnect: Disconnect | null = null;

export const connectToWebsocketAndFetchBlocks = (props: Props): void => {
  const { environment, organizationId, userId, apiUrl, apiFactory } = props;
  const api = apiFactory ? apiFactory(apiUrl, packageAndVersion) : getApi(apiUrl, packageAndVersion);

  const params = { environment, organizationId, userId };
  const wsUrl = (() => {
    const wsBase = apiUrl.replace("https://", "wss://").replace("http://", "ws://");
    return `${wsBase}/ws/sdk/block-updates?${new URLSearchParams(params).toString()}`;
  })();

  const fetchBlocks = (): void => {
    blocksError.value = false;
    void api
      .getBlocks({
        ...params,
        language: getUserLanguage(props.language),
        userProperties: props.userProperties,
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

  const handleBlockUpdate = (data: BlockUpdatesMessage): void => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- there will be more message types in the future
    if (data.type === "block-updates") {
      if (!blocksState.value) pendingMessages.value = [...pendingMessages.value, data];
      else blocksState.value = applyUpdateMessageToBlocksState(blocks.value, data);
    }
  };

  const onMessage = (event: MessageEvent<unknown>): void => {
    const data = parseWebsocketMessage(event);
    if (!data) return;
    handleBlockUpdate(data);
  };

  // Disconnect previous connection if it exists
  disconnect?.();

  if (api.listenToBlockUpdates) {
    fetchBlocks();
    disconnect = api.listenToBlockUpdates(params, handleBlockUpdate);
    return;
  }

  const websocketResult = websocket({ url: wsUrl, onMessage, onOpen: fetchBlocks });
  disconnect = websocketResult.disconnect;
};
