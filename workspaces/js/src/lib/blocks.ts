import {
  applyUpdateMessageToBlocksState,
  type BlockUpdatesPayload,
  getApi,
  getUserLanguage,
  type LanguageOption,
  log,
  type UserProperties,
} from "@flows/shared";
import { blocks, blocksState, pendingMessages } from "../store";
import { type Disconnect, websocket } from "./websocket";
import { packageAndVersion } from "./constants";

interface Props {
  apiUrl: string;
  environment: string;
  organizationId: string;
  userId: string;
  userProperties?: UserProperties;
  language?: LanguageOption;
}

let disconnect: Disconnect | null = null;

export const connectToWebsocketAndFetchBlocks = (props: Props): void => {
  const { environment, organizationId, userId, apiUrl } = props;
  const params = { environment, organizationId, userId };
  const wsUrl = (() => {
    const wsBase = apiUrl.replace("https://", "wss://").replace("http://", "ws://");
    return `${wsBase}/ws/sdk/block-updates?${new URLSearchParams(params).toString()}`;
  })();

  const fetchBlocks = (): void => {
    void getApi(apiUrl, packageAndVersion)
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
        log.error("Failed to load blocks", err);
      });
  };
  const onMessage = (event: MessageEvent<unknown>): void => {
    const data = JSON.parse(event.data as string) as BlockUpdatesPayload;
    if (!blocksState.value) pendingMessages.value = [...pendingMessages.value, data];
    else blocksState.value = applyUpdateMessageToBlocksState(blocks.value, data);
  };

  // Disconnect previous connection if it exists
  disconnect?.();

  const websocketResult = websocket({ url: wsUrl, onMessage, onOpen: fetchBlocks });
  disconnect = websocketResult.disconnect;
};
