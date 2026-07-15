import { log } from "../log";
import type { BlockType, TourStepType } from "../types";
import { type Block, type TourStep, type ActiveBlock } from "../types";
import { type BlockUpdatesMessage } from "../websocket-message";

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

export const filterVisibleBlocks = (
  blocks: Block[],
  ctx: { closedBlockStateIds: string[]; freeOrg: boolean; hostname: string },
): Block[] => {
  const closedBlockStateIdsSet = new Set(ctx.closedBlockStateIds);
  const removeCustomComponents = ctx.freeOrg && ctx.hostname !== "localhost";

  let blockedCustomComponentCount = 0;

  const filteredBlocks = blocks
    .filter((b) => {
      const isClosed = b.blockStateId ? closedBlockStateIdsSet.has(b.blockStateId) : false;

      const isCustomComponent = b.componentType && !b.componentLibraryName;
      const customComponentBlocked = removeCustomComponents && isCustomComponent;

      if (customComponentBlocked) blockedCustomComponentCount++;

      return !isClosed && !customComponentBlocked;
    })
    .map((b) => {
      const tourBlocks = b.tourBlocks?.filter((tb) => {
        const isCustomComponent = tb.componentType && !tb.componentLibraryName;
        const customComponentBlocked = removeCustomComponents && isCustomComponent;

        if (customComponentBlocked) blockedCustomComponentCount++;

        return !customComponentBlocked;
      });

      return { ...b, tourBlocks };
    });

  if (blockedCustomComponentCount > 0) {
    log.warn(
      `Blocked ${blockedCustomComponentCount} custom component${
        blockedCustomComponentCount > 1 ? "s" : ""
      } from rendering - custom components are restricted to localhost on the free plan. Upgrade to render them in production.`,
    );
  }

  return filteredBlocks;
};

const logSlottableError = (b: Block | TourStep, type: BlockType | TourStepType): void => {
  if (b.slottable && !b.slotId) {
    if (type === "component")
      log.error(
        `Encountered workflow block "${b.componentType}" that is slottable but has no slotId`,
      );
    if (type === "tour-component")
      log.error(`Encountered tour block "${b.componentType}" that is slottable but has no slotId`);
    if (type === "survey")
      log.error(
        `Encountered survey block "${b.componentType}" that is slottable but has no slotId`,
      );
  }
};

export const logSlottableBlocksError = (blocks: Block[]): void => {
  blocks.forEach((b) => {
    logSlottableError(b, b.type);

    b.tourBlocks?.forEach((tb) => {
      logSlottableError(tb, tb.type);
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
  if (type === "survey") log.error(`Component not found for survey block "${component}"`);
};

export const getBlockRenderKey = (block: ActiveBlock): string => {
  if (block.type === "tour-component" && block.tourBlockId) return block.tourBlockId;
  return block.id;
};
