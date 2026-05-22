import { computed } from "@preact/signals-core";
import { pathnameMatch } from "@flows/shared";
import { blocks, config, pathname, runningSurveyBlockStateIds, runningTours } from "./store";
import { itemToActiveBlock } from "./lib/active-block";

export const visibleBlocks = computed(() => {
  const blocksValue = blocks.value;
  const runningSurveyBlockStateIdsValue = runningSurveyBlockStateIds.value;
  const pathnameValue = pathname.value;

  const runningSurveyBlockStateIdsSet = new Set(runningSurveyBlockStateIdsValue);

  return blocksValue.filter((b) => {
    if (b.type === "survey") {
      const blockStateId = b.survey?.blockStateId;
      if (!blockStateId || !runningSurveyBlockStateIdsSet.has(blockStateId)) return false;
    }

    const pageTargetingMatch = pathnameMatch({
      pathname: pathnameValue,
      operator: b.page_targeting_operator,
      value: b.page_targeting_values,
    });

    return pageTargetingMatch;
  });
});

export const visibleTours = computed(() => {
  const blocksValue = blocks.value;
  const pathnameValue = pathname.value;
  const runningToursValue = runningTours.value;

  const blocksById = new Map(blocksValue.map((b) => [b.id, b]));
  return runningToursValue
    .filter((t) => {
      const block = blocksById.get(t.blockId);
      const activeStep = block?.tourBlocks?.at(t.currentBlockIndex);
      return pathnameMatch({
        pathname: pathnameValue,
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
  const configValue = config.value;
  const visibleBlocksValue = visibleBlocks.value;
  const visibleToursValue = visibleTours.value;

  const items = [
    ...visibleBlocksValue.filter((b) => !b.slottable),
    ...visibleToursValue.filter((t) => {
      const activeStep = t.block.tourBlocks?.at(t.currentBlockIndex);
      return !activeStep?.slottable;
    }),
  ];

  return items.flatMap((item) => itemToActiveBlock(item, configValue?.userProperties ?? {}));
});

export const slotBlocks = computed(() => visibleBlocks.value.filter((b) => b.slottable));
