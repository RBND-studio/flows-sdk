import { useMemo, type FC, type ReactNode } from "react";
import { type Block as IBlock } from "@flows/shared";
import { type RunningTour, useFlowsContext } from "../flows-context";
import { getSlot } from "../lib/selectors";
import { Block } from "./block";
import { TourBlock } from "./tour-block";

export interface FlowsSlotProps {
  id: string;
  placeholder?: ReactNode;
}

const isBlock = (item: IBlock | RunningTour): item is IBlock => "type" in item;

const getSlotIndex = (item: IBlock | RunningTour): number => {
  if (isBlock(item)) return item.slotIndex ?? 0;
  return item.activeStep?.slotIndex ?? 0;
};

export const FlowsSlot: FC<FlowsSlotProps> = ({ id, placeholder }) => {
  const { blocks, runningTours } = useFlowsContext();

  const sortedItems = useMemo(() => {
    const slotBlocks = blocks.filter((b) => b.slottable && getSlot(b) === id);
    const slotTourBlocks = runningTours.filter(
      (b) => b.activeStep?.slottable && getSlot(b.activeStep) === id,
    );
    return [...slotBlocks, ...slotTourBlocks].sort((a, b) => getSlotIndex(a) - getSlotIndex(b));
  }, [blocks, id, runningTours]);

  if (sortedItems.length)
    return (
      <>
        {sortedItems.map((item) => {
          if (isBlock(item)) return <Block key={item.id} block={item} />;
          return <TourBlock key={item.block.id} tour={item} />;
        })}
      </>
    );

  return placeholder ?? null;
};
