import type { BlockTriggerContext, IRunningTour, UserProperties } from "@flows/shared";
import {
  getHighestPriorityRunningTour,
  getPathname,
  getRunningToursFromSessionStorage,
  hasActiveTourSession,
  setRunningToursToSessionStorage,
  shouldTourOverrideOnlyRunning,
  sortToursByPriority,
  tourTriggerMatch,
  type Block,
} from "@flows/shared";
import { debounce } from "es-toolkit";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "../contexts/pathname-context";
import { type RunningTour } from "../flows-context";
import { api } from "../lib/api";

interface Props {
  blocks: Block[] | null;
  tourConcurrency: boolean;
  removeBlock: (blockId: string) => void;
  userProperties: UserProperties;
}

export const useRunningTours = ({
  blocks,
  tourConcurrency,
  removeBlock,
  userProperties,
}: Props): RunningTour[] => {
  const [runningTours, setRunningTours] = useState<IRunningTour[]>(
    getRunningToursFromSessionStorage().runningTours,
  );
  const [onlyRunningTourBlockId, setOnlyRunningTourBlockId] = useState<string | undefined>(
    getRunningToursFromSessionStorage().onlyRunningTourBlockId,
  );
  const runningToursRef = useRef<IRunningTour[]>(runningTours);
  runningToursRef.current = runningTours;
  const pathname = usePathname();
  const blocksRef = useRef<Block[] | null>(blocks);
  blocksRef.current = blocks;

  // Update running tours in sessionStorage
  useEffect(() => {
    setRunningToursToSessionStorage({
      onlyRunningTourBlockId,
      runningTours,
    });
  }, [onlyRunningTourBlockId, runningTours]);

  // Stop tours that are no longer running
  useEffect(() => {
    if (!blocks) return;
    setRunningTours((prev) => {
      const tourBlockIds = new Set(blocks.filter((b) => b.type === "tour").map((b) => b.id));
      // Filter out stopped tours
      return prev.filter((tour) => tourBlockIds.has(tour.blockId));
    });
  }, [blocks]);

  // Send heartbeat for running tours outside of first step and send tour session hint on pagehide
  useEffect(() => {
    const sendTourSessionHeartbeat = (): void => {
      const someTourOutsideOfFirstStep = runningToursRef.current.some((t) => {
        const block = blocksRef.current?.find((b) => b.id === t.blockId);
        return block && hasActiveTourSession({ block, currentTourIndex: t.currentBlockIndex });
      });

      if (!someTourOutsideOfFirstStep) return;
      // oxlint-disable-next-line typescript/no-deprecated - we're intentionally using send event without event queue to avoid resuming a tour on retry
      void api.sendEventImmediately({
        name: "tour-session-heartbeat",
        blockIds: runningToursRef.current
          .filter((t) => {
            const block = blocksRef.current?.find((b) => b.id === t.blockId);
            return block && hasActiveTourSession({ block, currentTourIndex: t.currentBlockIndex });
          })
          .map((t) => t.blockId),
      });
    };

    // Send first heartbeat 1 second after the page load
    const initialHeartbeatTimeout = setTimeout(() => {
      sendTourSessionHeartbeat();
    }, 1_000);
    const heartbeatInterval = setInterval(() => {
      sendTourSessionHeartbeat();
    }, 60_000);

    const pageHideHandler = () => {
      for (const tour of runningToursRef.current) {
        const isOutsideOfFirstStep = tour.currentBlockIndex > 0;
        if (!isOutsideOfFirstStep) continue;
        // oxlint-disable-next-line typescript/no-deprecated - we're intentionally using send event without event queue to use keepalive request
        void api.sendEventImmediately({
          name: "tour-session-hint",
          properties: { ending: true },
          blockId: tour.blockId,
        });
      }
    };
    addEventListener("pagehide", pageHideHandler);

    return () => {
      clearTimeout(initialHeartbeatTimeout);
      clearInterval(heartbeatInterval);
      removeEventListener("pagehide", pageHideHandler);
    };
  }, []);

  const startTour = useCallback(
    (blockId: string, options: { overrideOnlyRunning?: boolean } = {}) => {
      const blocksCurrent = blocksRef.current;
      if (!blocksCurrent) return;
      const block = blocksCurrent.find((b) => b.id === blockId);
      if (!block) return;
      setRunningTours((prev) => {
        const runningTour: IRunningTour = {
          blockId: block.id,
          currentBlockIndex: block.currentTourIndex ?? 0,
        };
        return [...prev, runningTour];
      });

      if (options.overrideOnlyRunning) {
        setOnlyRunningTourBlockId(blockId);
      }
    },
    [],
  );

  const startToursIfNeeded = useCallback(
    (ctx: BlockTriggerContext): void => {
      if (!blocks) return;
      const tourBlocks = blocks.filter((b) => b.type === "tour");
      const runningTourBlockIds = new Set(runningToursRef.current.map((t) => t.blockId));
      const matchingTours = tourBlocks.filter((block) => {
        if (runningTourBlockIds.has(block.id)) return false;
        const triggerMatch = tourTriggerMatch(block, ctx);
        if (!triggerMatch) return false;

        return true;
      });

      const sortedTours = sortToursByPriority(matchingTours);
      sortedTours.forEach((block, index) => {
        // Only highest priority tours is eligible for overrideOnlyRunning
        if (index === 0 && shouldTourOverrideOnlyRunning(block)) {
          startTour(block.id, { overrideOnlyRunning: true });
        }

        startTour(block.id);
      });
    },
    [blocks, startTour],
  );

  // Handle trigger by navigation
  useEffect(() => {
    if (!pathname) return;

    startToursIfNeeded({ pathname, userProperties });
  }, [pathname, startToursIfNeeded, userProperties]);

  // Handle trigger by DOM element
  useEffect(() => {
    const debouncedCallback = debounce(() => {
      startToursIfNeeded({ pathname: getPathname(), userProperties });
    }, 32);

    const observer = new MutationObserver(debouncedCallback);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    // Run once to catch existing elements
    debouncedCallback();
    return () => {
      observer.disconnect();
    };
  }, [startToursIfNeeded, userProperties]);

  // Handle trigger by click
  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      startToursIfNeeded({ pathname: getPathname(), event, userProperties });
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [startToursIfNeeded, userProperties]);

  const runningToursWithActiveBlock = useMemo(() => {
    if (!blocks) return [];
    const updateState = (blockId: string, updateFn: (tour: IRunningTour) => IRunningTour): void => {
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
          void api.sendEvent({ name: "tour-update", blockId, properties: { currentTourIndex } });
        };
        const handleContinue = (): void => {
          if (isLastStep) {
            removeBlock(blockId);
            void api.sendEvent({ name: "transition", propertyKey: "complete", blockId });
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
          void api.sendEvent({ name: "transition", blockId, propertyKey: "cancel" });
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

  useEffect(() => {
    if (tourConcurrency || onlyRunningTourBlockId) return;

    const highestPriorityTour = getHighestPriorityRunningTour(runningToursWithActiveBlock);
    if (highestPriorityTour) {
      setOnlyRunningTourBlockId(highestPriorityTour.id);
    }
  }, [runningToursWithActiveBlock, onlyRunningTourBlockId, tourConcurrency]);

  const onlyRunningTours = useMemo(() => {
    if (tourConcurrency || !onlyRunningTourBlockId) return runningToursWithActiveBlock;
    return runningToursWithActiveBlock.filter((tour) => tour.block.id === onlyRunningTourBlockId);
  }, [onlyRunningTourBlockId, runningToursWithActiveBlock, tourConcurrency]);

  return onlyRunningTours;
};
