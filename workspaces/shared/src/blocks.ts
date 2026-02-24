import { log } from "./log";
import { type Block, type TourStep, type ActiveBlock } from "./types";
import { type BlockUpdatesMessage } from "./websocket-message";

export const applyUpdateMessageToBlocksState = (
  blocks: Block[],
  message: BlockUpdatesMessage,
): Block[] => {
  const exitedOrUpdatedBlockIdsSet = new Set([
    ...message.exitedBlockIds,
    ...message.updatedBlocks.map((b) => b.id),
  ]);
  return [...blocks.filter((b) => !exitedOrUpdatedBlockIdsSet.has(b.id)), ...message.updatedBlocks];
};

const logSlottableError = (b: Block | TourStep, type: "component" | "tour-component"): void => {
  if (b.slottable && !b.slotId) {
    if (type === "component")
      log.error(
        `Encountered workflow block "${b.componentType}" that is slottable but has no slotId`,
      );
    if (type === "tour-component")
      log.error(`Encountered tour block "${b.componentType}" that is slottable but has no slotId`);
  }
};

export const logSlottableBlocksError = (blocks: Block[]): void => {
  blocks.forEach((b) => {
    logSlottableError(b, "component");

    b.tourBlocks?.forEach((tb) => {
      logSlottableError(tb, "tour-component");
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
