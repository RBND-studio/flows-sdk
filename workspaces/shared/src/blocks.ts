import { log } from "./log";
import { type BlockUpdatesPayload, type Block, type TourStep, type ActiveBlock } from "./types";

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

const logSlottableError = (b: Block | TourStep): void => {
  if (b.slottable && !b.slotId)
    log.error(
      `Encountered workflow block "${b.componentType}" that is slottable but has no slotId`,
    );
};

export const logSlottableBlocksError = (blocks: Block[]): void => {
  blocks.forEach((b) => {
    logSlottableError(b);

    b.tourBlocks?.forEach((tb) => {
      logSlottableError(tb);
    });
  });
};

export const logMissingComponentError = ({
  component,
  type,
}: {
  type: ActiveBlock["type"];
  component: ActiveBlock["component"];
}): void => {
  if (type === "tour-component")
    log.error(`Tour Component not found for tour block "${component}"`);
  if (type === "component") log.error(`Component not found for workflow block "${component}"`);
};

export const getBlockRenderKey = (block: ActiveBlock): string => {
  if (block.type === "tour-component" && block.tourBlockId) return block.tourBlockId;
  return block.id;
};
