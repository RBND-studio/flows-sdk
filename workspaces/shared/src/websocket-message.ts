import { type Block, type BlockUpdatesPayload } from "./types";

export interface BlockUpdatesMessage {
  type: "block-updates";
  exitedBlockIds: string[];
  updatedBlocks: Block[];
}

type FlowsWsMessage = BlockUpdatesMessage;

export const parseWebsocketMessage = (event: MessageEvent<unknown>): FlowsWsMessage | null => {
  const eventData = event.data;
  if (typeof eventData !== "string") return null;

  try {
    const data: unknown = JSON.parse(eventData);

    if (isBlockUpdatesPayload(data)) {
      return {
        type: "block-updates",
        exitedBlockIds: data.exitedBlockIds,
        updatedBlocks: data.updatedBlocks,
      };
    }
  } catch (err) {}

  return null;
};

function isBlockUpdatesPayload(data: unknown): data is BlockUpdatesPayload {
  return (
    typeof data === "object" && data !== null && "exitedBlockIds" in data && "updatedBlocks" in data
  );
}
