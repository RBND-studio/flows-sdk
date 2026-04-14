import { computed } from "@preact/signals-core";
import { pathnameMatch } from "@flows/shared";
import { blocks, config, pathname, runningSurveyIds, runningTours } from "./store";
import {
  blockToActiveBlock,
  surveyBlockToActiveBlock,
  tourToActiveBlock,
} from "./lib/active-block";

export const visibleBlocks = computed(() => {
  const blocksValue = blocks.value;
  const runningSurveyIdsValue = runningSurveyIds.value;
  const pathnameValue = pathname.value;

  const runningSurveyIdsSet = new Set(runningSurveyIdsValue);

  return blocksValue.filter((b) => {
    if (b.type === "survey" && !runningSurveyIdsSet.has(b.id)) return false;

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

  const floatingBlocks = visibleBlocks.value
    .filter((b) => !b.slottable)
    .flatMap((block) => {
      if (block.type === "survey")
        return surveyBlockToActiveBlock({
          block,
          userProperties: configValue?.userProperties ?? {},
        });
      return blockToActiveBlock({
        block,
        userProperties: configValue?.userProperties ?? {},
      });
    });
  const floatingTourBlocks = visibleTours.value
    .filter((t) => {
      const activeStep = t.block.tourBlocks?.at(t.currentBlockIndex);
      return !activeStep?.slottable;
    })
    .flatMap((tour) =>
      tourToActiveBlock({
        block: tour.block,
        currentIndex: tour.currentBlockIndex,
        userProperties: configValue?.userProperties ?? {},
      }),
    );
  return [...floatingBlocks, ...floatingTourBlocks];
});

export const slotBlocks = computed(() => visibleBlocks.value.filter((b) => b.slottable));
