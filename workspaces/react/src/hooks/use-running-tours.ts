import { useEffect, useMemo, useState } from "react";
import { pathnameMatch, type Block } from "@flows/shared";
import { type RunningTour } from "../flows-context";
import { sendEvent } from "../lib/api";
import { usePathname } from "../contexts/pathname-context";

type StateItem = Pick<RunningTour, "currentBlockIndex"> & {
  blockId: string;
};

interface Props {
  blocks: Block[];
  removeBlock: (blockId: string) => void;
}

export const useRunningTours = ({ blocks, removeBlock }: Props): RunningTour[] => {
  const [runningTours, setRunningTours] = useState<StateItem[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setRunningTours((prev) => {
      const tourBlocks = blocks.filter((b) => b.type === "tour");
      const tourBlockIds = new Set(tourBlocks.map((b) => b.id));
      const runningTourBlockIds = new Set(prev.map((t) => t.blockId));

      // Find newly started tours
      const newRunningTours = tourBlocks.flatMap((block): StateItem | never[] => {
        if (runningTourBlockIds.has(block.id)) return [];

        const pageTargetingMatch = pathnameMatch({
          pathname,
          operator: block.page_targeting_operator,
          value: block.page_targeting_values,
        });
        if (!pageTargetingMatch) return [];

        return {
          blockId: block.id,
          currentBlockIndex: block.currentTourIndex ?? 0,
        };
      });

      // Filter out stopped tours
      const updatedRunningTours = prev.filter((tour) => tourBlockIds.has(tour.blockId));

      return [...updatedRunningTours, ...newRunningTours];
    });
  }, [pathname, blocks]);

  const runningToursWithActiveBlock = useMemo(() => {
    const updateState = (blockId: string, updateFn: (tour: StateItem) => StateItem): void => {
      setRunningTours((prev) =>
        prev.map((tour) => (tour.blockId === blockId ? updateFn(tour) : tour)),
      );
    };
    const setCurrentBlockIndex = (blockId: string, value: number): void => {
      updateState(blockId, (tour) => ({ ...tour, currentBlockIndex: value }));
    };

    return runningTours
      .map(({ blockId, currentBlockIndex }): RunningTour | undefined => {
        const block = blocks.find((b) => b.id === blockId);
        if (!block) return;

        const activeStep = block.tourBlocks?.[currentBlockIndex];
        const isLastStep = currentBlockIndex === (block.tourBlocks?.length ?? 0) - 1;
        const sendTourUpdate = (currentTourIndex: number): void => {
          void sendEvent({ name: "tour-update", blockId, properties: { currentTourIndex } });
        };
        const handleContinue = (): void => {
          if (isLastStep) {
            removeBlock(blockId);
            void sendEvent({ name: "transition", propertyKey: "complete", blockId });
          } else {
            const newIndex = currentBlockIndex + 1;
            setCurrentBlockIndex(blockId, newIndex);
            sendTourUpdate(newIndex);
          }
        };
        const handlePrevious = (): void => {
          let newIndex = currentBlockIndex === 0 ? currentBlockIndex : currentBlockIndex - 1;
          while (newIndex > 0 && block.tourBlocks && !block.tourBlocks.at(newIndex)?.componentType)
            newIndex -= 1;
          setCurrentBlockIndex(blockId, newIndex);
          sendTourUpdate(newIndex);
        };
        const handleCancel = (): void => {
          removeBlock(blockId);
          void sendEvent({ name: "transition", blockId, propertyKey: "cancel" });
        };

        return {
          block,
          currentBlockIndex,
          activeStep,
          continue: handleContinue,
          previous: handlePrevious,
          cancel: handleCancel,
        };
      })
      .filter((x): x is RunningTour => Boolean(x));
  }, [blocks, removeBlock, runningTours]);

  return runningToursWithActiveBlock;
};
