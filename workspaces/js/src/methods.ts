import { computed, effect, type ReadonlySignal } from "@preact/signals-core";
import { type ActiveBlock, type Block } from "@flows/shared";
import { config, type RunningTour } from "./store";
import { blockToActiveBlock, tourToActiveBlock } from "./lib/active-block";
import { sendEvent } from "./lib/api";
import { floatingItems, slotBlocks, visibleTours } from "./computed";

const isBlock = (item: Block | RunningTour): item is Block => "type" in item;
const getSlotIndex = (item: Block | (RunningTour & { block: Block })): number => {
  if (isBlock(item)) return item.slotIndex ?? 0;
  const activeStep = item.block.tourBlocks?.at(item.currentBlockIndex);
  return activeStep?.slotIndex ?? 0;
};

const computedActiveBlocksBySlotId = new Map<string, ReadonlySignal<ActiveBlock[]>>();
const addActiveSlotBlocksComputed = (slotId: string): ReadonlySignal<ActiveBlock[]> => {
  const newComputed = computed(() => {
    const configValue = config.value;

    const workflowBlocks = slotBlocks.value.filter((b) => b.slottable && b.slotId === slotId);
    const tours = visibleTours.value.filter((t) => {
      const activeStep = t.block.tourBlocks?.at(t.currentBlockIndex);
      return activeStep?.slottable && activeStep.slotId === slotId;
    });
    const sorted = [...workflowBlocks, ...tours].sort((a, b) => getSlotIndex(a) - getSlotIndex(b));
    return sorted.flatMap((item) => {
      if (isBlock(item))
        return blockToActiveBlock({
          block: item,
          templateUserProperties: configValue?.templateUserProperties ?? {},
        });
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
 * Start a workflow from a manual start block. The workflow will only start if:
 * - Workflow is published in the current environment
 * - Workflow has a manual start block with a matching block key
 * - The current user can access the workflow based on the frequency setting
 * - The current user matches the start block's user property conditions
 * @param blockKey - block key of the manual start block
 */
export const startWorkflow = (blockKey: string): Promise<void> =>
  sendEvent({ name: "workflow-start", blockKey });
