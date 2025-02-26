import { useEffect, useMemo, useState } from "react";
import { type Block } from "@flows/shared";
import { type RunningTour } from "../flows-context";
import { sendEvent } from "../lib/api";

type StateItem = Pick<RunningTour, "currentBlockIndex" | "hidden"> & {
  blockId: string;
};

interface Props {
  blocks: Block[];
}

export const useRunningTours = ({ blocks }: Props): RunningTour[] => {
  const [runningTours, setRunningTours] = useState<StateItem[]>([]);

  useEffect(() => {
    setRunningTours((prev) => {
      const tourBlocks = blocks.filter((block) => block.type === "tour");
      const previousTourMap = new Map(prev.map((tour) => [tour.blockId, tour]));
      const newRunningTours = tourBlocks.map((block): StateItem => {
        const currentState = previousTourMap.get(block.id);
        const currentBlockIndex = currentState?.currentBlockIndex ?? block.currentTourIndex ?? 0;
        const hidden = currentState?.hidden ?? false;

        return {
          blockId: block.id,
          currentBlockIndex,
          hidden,
        };
      });
      return newRunningTours;
    });
  }, [blocks]);

  const runningToursWithActiveBlock = useMemo(() => {
    const updateState = (blockId: string, updateFn: (tour: StateItem) => StateItem): void => {
      setRunningTours((prev) =>
        prev.map((tour) => (tour.blockId === blockId ? updateFn(tour) : tour)),
      );
    };
    const hide = (blockId: string): void => {
      updateState(blockId, (tour) => ({ ...tour, hidden: true }));
    };
    const setCurrentBlockIndex = (blockId: string, value: number): void => {
      updateState(blockId, (tour) => ({ ...tour, currentBlockIndex: value }));
    };

    return runningTours
      .map(({ blockId, currentBlockIndex, hidden }): RunningTour | undefined => {
        const block = blocks.find((b) => b.id === blockId);
        if (!block) return;

        const activeStep = block.tourBlocks?.[currentBlockIndex];
        const isLastStep = currentBlockIndex === (block.tourBlocks?.length ?? 0) - 1;
        const sendTourUpdate = (currentTourIndex: number): void => {
          void sendEvent({ name: "tour-update", blockId, properties: { currentTourIndex } });
        };
        const handleContinue = (): void => {
          if (isLastStep) {
            hide(blockId);
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
          hide(blockId);
          void sendEvent({ name: "transition", blockId, propertyKey: "cancel" });
        };

        return {
          block,
          hidden,
          currentBlockIndex,
          activeStep,
          hide() {
            hide(blockId);
          },
          continue: handleContinue,
          previous: handlePrevious,
          cancel: handleCancel,
        };
      })
      .filter((x): x is RunningTour => Boolean(x));
  }, [blocks, runningTours]);

  return runningToursWithActiveBlock;
};
