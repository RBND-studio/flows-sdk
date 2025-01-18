import { type BlockUpdatesPayload, getApi, log, type UserProperties } from "@flows/shared";
import { blocks } from "../store";
import { websocket } from "./websocket";

interface Props {
  apiUrl: string;
  environment: string;
  organizationId: string;
  userId: string;
  userProperties?: UserProperties;
}

export const connectToWebsocketAndFetchBlocks = (props: Props): void => {
  const { environment, organizationId, userId, apiUrl } = props;
  const params = { environment, organizationId, userId };
  const wsUrl = (() => {
    const wsBase = apiUrl.replace("https://", "wss://").replace("http://", "ws://");
    return `${wsBase}/ws/sdk/block-updates?${new URLSearchParams(params).toString()}`;
  })();

  const fetchBlocks = (): void => {
    void getApi(apiUrl)
      .getBlocks({ ...params, userProperties: props.userProperties })
      .then((res) => {
        blocks.value = res.blocks;
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

  websocket({ url: wsUrl, onMessage, onOpen: fetchBlocks });
};
