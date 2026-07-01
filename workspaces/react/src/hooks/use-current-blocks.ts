import { type ActiveBlock, type Block, pathnameMatch, template } from "@flows/shared";
import { useMemo } from "react";
import { type RunningTour, useFlowsContext } from "../flows-context";
import { usePathname } from "../contexts/pathname-context";
import { isBlock, itemToActiveBlock } from "../lib/active-block";
import { getSlot } from "../lib/selectors";

export const useVisibleBlocks = (): Block[] => {
  const { blocks, runningSurveyBlockStateIds, userProperties } = useFlowsContext();
  const pathname = usePathname();
  return useMemo(() => {
    const runningSurveyBlockStateIdsSet = new Set(runningSurveyBlockStateIds);

    return (blocks ?? []).filter((b) => {
      if (b.type === "survey") {
        const blockStateId = b.blockStateId;
        if (!blockStateId || !runningSurveyBlockStateIdsSet.has(blockStateId)) return false;
      }

      const pageTargetingMatch = pathnameMatch({
        pathname,
        operator: b.page_targeting_operator,
        value: b.page_targeting_values?.map((v) => template(v, userProperties)),
      });

      return pageTargetingMatch;
    });
  }, [blocks, pathname, runningSurveyBlockStateIds, userProperties]);
};

const useVisibleTours = (): RunningTour[] => {
  const { runningTours, userProperties } = useFlowsContext();
  const pathname = usePathname();
  return useMemo(
    () =>
      runningTours.filter((tour) => {
        const activeStep = tour.activeStep;
        return (
          activeStep &&
          pathnameMatch({
            pathname,
            operator: activeStep.page_targeting_operator,
            value: activeStep.page_targeting_values?.map((v) => template(v, userProperties)),
          })
        );
      }),
    [pathname, runningTours, userProperties],
  );
};

/**
 * Get all the currently displayed workflow and tour blocks that are not slottable.
 * @returns array of `ActiveBlock` objects
 */
export const useCurrentFloatingBlocks = (): ActiveBlock[] => {
  const visibleBlocks = useVisibleBlocks();
  const visibleTours = useVisibleTours();
  const { removeBlock, updateBlock, userProperties, freeOrg } = useFlowsContext();

  return useMemo(() => {
    const items = [
      ...visibleBlocks.filter((b) => !b.slottable),
      ...visibleTours.filter((tour) => {
        const activeStep = tour.activeStep;
        return activeStep && !activeStep.slottable;
      }),
    ];

    return items.flatMap((item) =>
      itemToActiveBlock(item, { removeBlock, updateBlock, userProperties, freeOrg }),
    );
  }, [removeBlock, updateBlock, userProperties, visibleBlocks, visibleTours, freeOrg]);
};

const getSlotIndex = (item: Block | RunningTour): number => {
  if (isBlock(item)) return item.slotIndex ?? 0;
  return item.activeStep?.slotIndex ?? 0;
};

/**
 * Get all the currently displayed workflow and tour blocks for a specific slot.
 * @param slotId - the slot id to get the blocks for
 * @returns array of `ActiveBlock` objects
 */
export const useCurrentSlotBlocks = (slotId: string): ActiveBlock[] => {
  const visibleBlocks = useVisibleBlocks();
  const visibleTours = useVisibleTours();
  const { removeBlock, updateBlock, userProperties, freeOrg } = useFlowsContext();

  const sortedActiveBlocks = useMemo(() => {
    const slotBlocks = visibleBlocks.filter((b) => b.slottable && getSlot(b) === slotId);
    const slotTourBlocks = visibleTours.filter(
      (b) => b.activeStep?.slottable && getSlot(b.activeStep) === slotId,
    );
    return [...slotBlocks, ...slotTourBlocks]
      .sort((a, b) => getSlotIndex(a) - getSlotIndex(b))
      .flatMap((item) =>
        itemToActiveBlock(item, { removeBlock, updateBlock, userProperties, freeOrg }),
      );
  }, [removeBlock, slotId, userProperties, updateBlock, visibleBlocks, visibleTours, freeOrg]);

  return sortedActiveBlocks;
};
