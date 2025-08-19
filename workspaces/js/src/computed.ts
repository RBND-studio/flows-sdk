import { computed } from "@preact/signals-core";
import { pathnameMatch } from "@flows/shared";
import { blocks, pathname, runningTours } from "./store";
import { blockToActiveBlock, tourToActiveBlock } from "./lib/active-block";

export const visibleBlocks = computed(() =>
  blocks.value.filter((b) =>
    pathnameMatch({
      pathname: pathname.value,
      operator: b.page_targeting_operator,
      value: b.page_targeting_values,
    }),
  ),
);
export const visibleTours = computed(() => {
  const blocksById = new Map(blocks.value.map((b) => [b.id, b]));
  return runningTours.value
    .filter((t) => {
      const block = blocksById.get(t.blockId);
      const activeStep = block?.tourBlocks?.at(t.currentBlockIndex);
      return pathnameMatch({
        pathname: pathname.value,
        operator: activeStep?.page_targeting_operator,
        value: activeStep?.page_targeting_values,
      });
    })
    .flatMap((t) => {
      const block = blocksById.get(t.blockId);
      if (!block) return [];
      return { ...t, block };
    });
});

export const floatingItems = computed(() => {
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

export const slotBlocks = computed(() => visibleBlocks.value.filter((b) => b.slottable));
