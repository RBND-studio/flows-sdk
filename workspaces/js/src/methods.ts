import { computed, effect, type ReadonlySignal } from "@preact/signals-core";
import { pathnameMatch } from "@flows/shared";
import { type ActiveBlock } from "./types/active-block";
import { blocks, pathname, runningTours } from "./store";
import { blockToActiveBlock, tourToActiveBlock } from "./lib/active-block";

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
      return (
        !t.hidden &&
        pathnameMatch({
          pathname: pathname.value,
          operator: block?.page_targeting_operator,
          value: block?.page_targeting_values,
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

const computedActiveBlocksBySlotId = new Map<string, ReadonlySignal<ActiveBlock[]>>();
const addActiveSlotBlocksComputed = (slotId: string): ReadonlySignal<ActiveBlock[]> => {
  const newComputed = computed(() =>
    slotBlocks.value
      .filter((b) => b.slotId === slotId)
      .sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0))
      .flatMap(blockToActiveBlock),
  );
  computedActiveBlocksBySlotId.set(slotId, newComputed);
  return newComputed;
};

export const getCurrentFloatingBlocks = (): ActiveBlock[] => floatingItems.value;
export const getCurrentSlotBlocks = (slotId: string): ActiveBlock[] =>
  computedActiveBlocksBySlotId.get(slotId)?.value ?? addActiveSlotBlocksComputed(slotId).value;

export const addFloatingBlocksChangeListener = (
  listener: (items: ActiveBlock[]) => void,
): (() => void) => {
  return effect(() => {
    listener(floatingItems.value);
  });
};
export const addSlotBlocksChangeListener = (
  slotId: string,
  listener: (items: ActiveBlock[]) => void,
): (() => void) => {
  return effect(() => {
    listener(getCurrentSlotBlocks(slotId));
  });
};
