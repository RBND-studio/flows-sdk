import { type ActiveBlock, type Block, pathnameMatch } from "@flows/shared";
import { useMemo } from "react";
import { type RunningTour, useFlowsContext } from "../flows-context";
import { usePathname } from "../contexts/pathname-context";
import { blockToActiveBlock, tourBlockToActiveBlock } from "../lib/active-block";
import { getSlot } from "../lib/selectors";

export const useVisibleBlocks = (): Block[] => {
  const { blocks } = useFlowsContext();
  const pathname = usePathname();
  return useMemo(
    () =>
      blocks.filter((b) =>
        pathnameMatch({
          pathname,
          operator: b.page_targeting_operator,
          value: b.page_targeting_values,
        }),
      ),
    [blocks, pathname],
  );
};

const useVisibleTours = (): RunningTour[] => {
  const { runningTours } = useFlowsContext();
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
            value: activeStep.page_targeting_values,
          })
        );
      }),
    [pathname, runningTours],
  );
};

/**
 * Get all the currently displayed workflow and tour blocks that are not slottable.
 * @returns array of `ActiveBlock` objects
 */
export const useCurrentFloatingBlocks = (): ActiveBlock[] => {
  const visibleBlocks = useVisibleBlocks();
  const visibleTours = useVisibleTours();
  const { removeBlock, updateBlock, userProperties, LinkComponent } = useFlowsContext();

  const floatingBlocks = useMemo(
    () =>
      visibleBlocks
        .filter((b) => !b.slottable)
        .flatMap((block) =>
          blockToActiveBlock({ block, removeBlock, updateBlock, userProperties, LinkComponent }),
        ),
    [visibleBlocks, removeBlock, updateBlock, userProperties, LinkComponent],
  );
  const floatingTourBlocks = useMemo(
    () =>
      visibleTours
        .filter((tour) => {
          const activeStep = tour.activeStep;
          return activeStep && !activeStep.slottable;
        })
        .flatMap((tour) => tourBlockToActiveBlock({ tour, userProperties })),
    [userProperties, visibleTours],
  );

  return [...floatingBlocks, ...floatingTourBlocks];
};

const isBlock = (item: Block | RunningTour): item is Block => "type" in item;

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
  const { removeBlock, updateBlock, userProperties } = useFlowsContext();

  const sortedActiveBlocks = useMemo(() => {
    const slotBlocks = visibleBlocks.filter((b) => b.slottable && getSlot(b) === slotId);
    const slotTourBlocks = visibleTours.filter(
      (b) => b.activeStep?.slottable && getSlot(b.activeStep) === slotId,
    );
    return [...slotBlocks, ...slotTourBlocks]
      .sort((a, b) => getSlotIndex(a) - getSlotIndex(b))
      .flatMap((item) => {
        if (isBlock(item))
          return blockToActiveBlock({
            block: item,
            removeBlock,
            updateBlock,
            userProperties,
          });
        return tourBlockToActiveBlock({ tour: item, userProperties });
      });
  }, [removeBlock, slotId, userProperties, updateBlock, visibleBlocks, visibleTours]);

  return sortedActiveBlocks;
};
