import { computed, effect, type ReadonlySignal } from "@preact/signals-core";
import { type ActiveBlock, type Block, pathnameMatch } from "@flows/shared";
import { blocks, pathname, type RunningTour, runningTours } from "./store";
import { blockToActiveBlock, tourToActiveBlock } from "./lib/active-block";
import { sendEvent } from "./lib/api";

const visibleBlocks = computed(() =>
  blocks.value.filter((b) =>
    pathnameMatch({
      pathname: pathname.value,
      operator: b.page_targeting_operator,
      value: b.page_targeting_values,
    }),
  ),
);
const visibleTours = computed(() => {
  const blocksById = new Map(blocks.value.map((b) => [b.id, b]));
  return runningTours.value
    .filter((t) => {
      const block = blocksById.get(t.blockId);
      const activeStep = block?.tourBlocks?.at(t.currentBlockIndex);
      return (
        !t.hidden &&
        pathnameMatch({
          pathname: pathname.value,
          operator: activeStep?.page_targeting_operator,
          value: activeStep?.page_targeting_values,
        })
      );
    })
    .flatMap((t) => {
      const block = blocksById.get(t.blockId);
      if (!block) return [];
      return { ...t, block };
    });
});

const floatingItems = computed(() => {
  const floatingBlocks = visibleBlocks.value
    .filter((b) => !b.slottable)
    .flatMap(blockToActiveBlock);
  const floatingTourBlocks = visibleTours.value
    .filter((t) => {
      const activeStep = t.block.tourBlocks?.at(t.currentBlockIndex);
      return !activeStep?.slottable;
    })
    .flatMap((tour) => tourToActiveBlock(tour.block, tour.currentBlockIndex));
  return [...floatingBlocks, ...floatingTourBlocks];
});

const slotBlocks = computed(() => visibleBlocks.value.filter((b) => b.slottable));

const isBlock = (item: Block | RunningTour): item is Block => "type" in item;
const getSlotIndex = (item: Block | (RunningTour & { block: Block })): number => {
  if (isBlock(item)) return item.slotIndex ?? 0;
  const activeStep = item.block.tourBlocks?.at(item.currentBlockIndex);
  return activeStep?.slotIndex ?? 0;
};

const computedActiveBlocksBySlotId = new Map<string, ReadonlySignal<ActiveBlock[]>>();
const addActiveSlotBlocksComputed = (slotId: string): ReadonlySignal<ActiveBlock[]> => {
  const newComputed = computed(() => {
    const workflowBlocks = slotBlocks.value.filter((b) => b.slottable && b.slotId === slotId);
    const tours = visibleTours.value.filter((t) => {
      const activeStep = t.block.tourBlocks?.at(t.currentBlockIndex);
      return activeStep?.slottable && activeStep.slotId === slotId;
    });
    const sorted = [...workflowBlocks, ...tours].sort((a, b) => getSlotIndex(a) - getSlotIndex(b));
    return sorted.flatMap((item) => {
      if (isBlock(item)) return blockToActiveBlock(item);
      return tourToActiveBlock(item.block, item.currentBlockIndex);
    });
  });
  computedActiveBlocksBySlotId.set(slotId, newComputed);
  return newComputed;
};

/**
 * Get all the currently displayed workflow and tour blocks that are not slottable.
 *
 * @returns array of `ActiveBlock` objects
 */
export const getCurrentFloatingBlocks = (): ActiveBlock[] => floatingItems.value;
/**
 * Get all the currently displayed workflow and tour blocks for a specific slot.
 *
 * @param slotId - the slot id to get the blocks for
 * @returns array of `ActiveBlock` objects
 */
export const getCurrentSlotBlocks = (slotId: string): ActiveBlock[] =>
  computedActiveBlocksBySlotId.get(slotId)?.value ?? addActiveSlotBlocksComputed(slotId).value;

/**
 * Add a listener that will be called every time the floating workflow and tour blocks (blocks that are not slottable) change.
 *
 * @param listener - Callback function that receives array of `ActiveBlock` objects
 * @returns `dispose` function that should be called to stop listening to the changes to avoid memory leaks
 *
 * @example
 * ```js
 * import { addFloatingBlocksChangeListener } from "@flows/js";
 *
 * const dispose = addFloatingBlocksChangeListener((blocks) => {
 *   // Update state in your application or render the blocks directly
 * })
 *
 * // Call `dispose` when you want to stop listening to the changes to avoid memory leaks
 * dispose();
 * ```
 */
export const addFloatingBlocksChangeListener = (
  listener: (items: ActiveBlock[]) => void,
): (() => void) => {
  return effect(() => {
    listener(floatingItems.value);
  });
};

/**
 * Add a listener that will be called every time the blocks for a specific slot change.
 *
 * @param slotId - Slot id to listen for changes
 * @param listener - Callback function that receives array of `ActiveBlock` objects
 * @returns `dispose` function that should be called to stop listening to the changes to avoid memory leaks
 *
 * @example
 * ```js
 * import { addSlotBlocksChangeListener } from "@flows/js";
 *
 * const dispose = addSlotBlocksChangeListener("my-slot-id", (blocks) => {
 *   // Update state in your application or render the blocks directly
 * })
 *
 * // Call `dispose` when you want to stop listening to the changes to avoid memory leaks
 * dispose();
 * ```
 */
export const addSlotBlocksChangeListener = (
  slotId: string,
  listener: (items: ActiveBlock[]) => void,
): (() => void) => {
  return effect(() => {
    listener(getCurrentSlotBlocks(slotId));
  });
};

/**
 * Reset progress for all workflows for the current user in the current environment.
 */
export const resetAllWorkflowsProgress = (): Promise<void> => sendEvent({ name: "reset-progress" });

/**
 * Reset progress of one workflow for the current user in the current environment.
 * @param workflowId - UUID of the workflow to reset progress for
 */
export const resetWorkflowProgress = (workflowId: string): Promise<void> =>
  sendEvent({ name: "reset-progress", workflowId });

/**
 * Start a workflow if it's published has a manual start block and respect its frequency setting.
 * @param blockKey - block key of the manual start block
 */
export const startWorkflow = (blockKey: string): Promise<void> =>
  sendEvent({ name: "workflow-start", blockKey });
