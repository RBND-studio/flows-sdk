import { type BlockUpdatesPayload, type Block } from "./types";

export const applyUpdateMessageToBlocksState = (
  blocks: Block[],
  message: BlockUpdatesPayload,
): Block[] => {
  const exitedOrUpdatedBlockIdsSet = new Set([
    ...message.exitedBlockIds,
    ...message.updatedBlocks.map((b) => b.id),
  ]);
  return [...blocks.filter((b) => !exitedOrUpdatedBlockIdsSet.has(b.id)), ...message.updatedBlocks];
};
