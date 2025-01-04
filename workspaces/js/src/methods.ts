import { computed, effect, type ReadonlySignal } from "@preact/signals-core";
import { type ActiveBlock } from "./types/active-block";
import { blocks } from "./store";
import { blockToActiveBlock } from "./lib/active-block";

const floatingItems = computed(() =>
  blocks.value
    .filter(
      (b) =>
        !b.slottable &&
        // tour block doesn't have componentType
        b.componentType,
    )
    .flatMap(blockToActiveBlock),
);

const slotBlocks = computed(() => blocks.value.filter((b) => b.slottable));

const computedActiveBlocksBySlotId = new Map<string, ReadonlySignal<ActiveBlock[]>>();
const addActiveSlotBlocksComputed = (slotId: string): ReadonlySignal<ActiveBlock[]> => {
  const newComputed = computed(() =>
    slotBlocks.value.filter((b) => b.slotId === slotId).flatMap(blockToActiveBlock),
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
