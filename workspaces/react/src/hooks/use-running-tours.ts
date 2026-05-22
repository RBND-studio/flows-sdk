import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPathname, tourTriggerMatch, type Block } from "@flows/shared";
import { debounce } from "es-toolkit";
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
  const runningToursRef = useRef<StateItem[]>(runningTours);
  runningToursRef.current = runningTours;
  const pathname = usePathname();

  // Stop tours that are no longer running
  useEffect(() => {
    setRunningTours((prev) => {
      const tourBlockIds = new Set(blocks.filter((b) => b.type === "tour").map((b) => b.id));
      // Filter out stopped tours
      return prev.filter((tour) => tourBlockIds.has(tour.blockId));
    });
  }, [blocks]);

  const startToursIfNeeded = useCallback(
    (ctx: { pathname: string; event?: MouseEvent }): void => {
      const tourBlocks = blocks.filter((b) => b.type === "tour");
      const runningTourBlockIds = new Set(runningToursRef.current.map((t) => t.blockId));
      tourBlocks.forEach((block) => {
        if (runningTourBlockIds.has(block.id)) return;
        const triggerMatch = tourTriggerMatch(block, ctx);
        if (!triggerMatch) return;

        setRunningTours((prev) => {
          const runningTour: StateItem = {
            blockId: block.id,
            currentBlockIndex: block.currentTourIndex ?? 0,
          };
          return [...prev, runningTour];
        });
      });
    },
    [blocks],
  );

  // Handle trigger by navigation
  useEffect(() => {
    if (!pathname) return;

    startToursIfNeeded({ pathname });
  }, [pathname, startToursIfNeeded]);

  // Handle trigger by DOM element
  useEffect(() => {
    const debouncedCallback = debounce(() => {
      startToursIfNeeded({ pathname: getPathname() });
    }, 32);

    const observer = new MutationObserver(debouncedCallback);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    // Run once to catch existing elements
    debouncedCallback();
    return () => {
      observer.disconnect();
    };
  }, [startToursIfNeeded]);

  // Handle trigger by click
  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      startToursIfNeeded({ pathname: getPathname(), event });
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [startToursIfNeeded]);

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
            sendTourUpdate(newIndex);

            // Update the step with a timeout to avoid navigation with href from the next step
            setTimeout(() => {
              setCurrentBlockIndex(blockId, newIndex);
            }, 0);
          }
        };
        const handlePrevious = (): void => {
          let newIndex = currentBlockIndex === 0 ? currentBlockIndex : currentBlockIndex - 1;
          while (newIndex > 0 && block.tourBlocks && !block.tourBlocks.at(newIndex)?.componentType)
            newIndex -= 1;
          sendTourUpdate(newIndex);

          // Update the step with a timeout to avoid navigation with href from the previous step
          setTimeout(() => {
            setCurrentBlockIndex(blockId, newIndex);
          }, 0);
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
