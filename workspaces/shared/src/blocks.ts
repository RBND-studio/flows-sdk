import { type BlockUpdatesPayload, type Block } from "./types";

export const applyUpdateMessageToBlocksState = (
  blocks: Block[],
  message: BlockUpdatesPayload,
): Block[] => {
  const exitedBlockIdsSet = new Set(message.exitedBlockIds);
  return [...blocks.filter((b) => !exitedBlockIdsSet.has(b.id)), ...message.updatedBlocks];
};
