import { type BlockUpdatesPayload, getApi, log, type UserProperties } from "@flows/shared";
import { blocks } from "../store";
import { type Disconnect, websocket } from "./websocket";
import { packageAndVersion } from "./constants";

interface Props {
  apiUrl: string;
  environment: string;
  organizationId: string;
  userId: string;
  userProperties?: UserProperties;
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
      .getBlocks({ ...params, userProperties: props.userProperties })
      .then((res) => {
        blocks.value = res.blocks;
        // Disconnect if the user is usage limited
        if (res.meta?.usage_limited) disconnect?.();
      })
      .catch((err: unknown) => {
        log.error("Failed to load blocks", err);
      });
  };
  const onMessage = (event: MessageEvent<unknown>): void => {
    const data = JSON.parse(event.data as string) as BlockUpdatesPayload;
    const exitedOrUpdatedBlockIdsSet = new Set([
      ...data.exitedBlockIds,
      ...data.updatedBlocks.map((b) => b.id),
    ]);
    blocks.value = [
      ...blocks.value.filter((block) => !exitedOrUpdatedBlockIdsSet.has(block.id)),
      ...data.updatedBlocks,
    ];
  };

  // Disconnect previous connection if it exists
  disconnect?.();

  const websocketResult = websocket({ url: wsUrl, onMessage, onOpen: fetchBlocks });
  disconnect = websocketResult.disconnect;
};
