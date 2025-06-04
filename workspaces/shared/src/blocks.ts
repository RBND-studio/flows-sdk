import { type Block } from "./types";

export const deduplicateBlocks = (prevBlocks: Block[], updatedBlocks: Block[]): Block[] => {
  const blocksById = new Map(prevBlocks.map((b) => [b.id, b]));
  updatedBlocks.forEach((updatedBlock) => {
    blocksById.set(updatedBlock.id, updatedBlock);
  });
  return Array.from(blocksById.values());
};
