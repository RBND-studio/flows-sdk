import type { BlockTriggerContext, UserProperties } from "@flows/shared";
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

type IRunningTour = {
  blockStateId: string;
  currentBlockIndex: number;
};

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
  // This is the source of truth for running tours
  const [runningTourBlockStateIds, setRunningTourBlockStateIds] = useState<string[]>(
    getRunningToursFromSessionStorage().runningTourBlockStateIds,
  );
  const [onlyRunningTourBlockStateId, setOnlyRunningTourBlockStateId] = useState<
    string | undefined
  >(getRunningToursFromSessionStorage().onlyRunningTourBlockStateId);
  // Update running tours in sessionStorage
  useEffect(() => {
    setRunningToursToSessionStorage({
      onlyRunningTourBlockStateId,
      runningTourBlockStateIds,
    });
  }, [onlyRunningTourBlockStateId, runningTourBlockStateIds]);

  // This is only "proxy" state with current tour index
  const [runningTours, setRunningTours] = useState<IRunningTour[]>([]);
  console.log(runningTours);
  useEffect(() => {
    if (!blocks) return setRunningTours([]);

    const blocksByStateId = new Map(blocks.map((b) => [b.blockStateId, b]));
    setRunningTours((prev) => {
      const prevById = new Map(prev.map((t) => [t.blockStateId, t]));

      return runningTourBlockStateIds.map((blockStateId): IRunningTour => {
        const prevState = prevById.get(blockStateId);
        if (prevState) return prevState;
        return {
          blockStateId,
          currentBlockIndex: blocksByStateId.get(blockStateId)?.currentTourIndex ?? 0,
        };
      });
    });
  }, [runningTourBlockStateIds, blocks]);
  const runningToursRef = useRef<IRunningTour[]>(runningTours);
  runningToursRef.current = runningTours;
  const onlyRunningTourBlockStateIdRef = useRef<string | undefined>(onlyRunningTourBlockStateId);
  onlyRunningTourBlockStateIdRef.current = onlyRunningTourBlockStateId;
  const pathname = usePathname();
  const blocksRef = useRef<Block[] | null>(blocks);
  blocksRef.current = blocks;

  // Stop tours that are no longer running
  useEffect(() => {
    if (!blocks) return;
    setRunningTourBlockStateIds((prev) => {
      const tourBlockStateIds = new Set(
        blocks.filter((b) => b.type === "tour").map((b) => b.blockStateId),
      );
      // Filter out stopped tours
      return prev.filter((blockStateId) => tourBlockStateIds.has(blockStateId));
    });
  }, [blocks]);

  // Send heartbeat for running tours outside of first step and send tour session hint on pagehide
  useEffect(() => {
    const getRunningTours = () => {
      if (onlyRunningTourBlockStateIdRef.current) {
        const onlyRunningTourDef = runningToursRef.current.find(
          (t) => t.blockStateId === onlyRunningTourBlockStateIdRef.current,
        );
        if (onlyRunningTourDef) return [onlyRunningTourDef];
      }
      return runningToursRef.current;
    };

    const sendTourSessionHeartbeat = (): void => {
      const someTourOutsideOfFirstStep = getRunningTours().some((t) => {
        const block = blocksRef.current?.find((b) => b.blockStateId === t.blockStateId);
        return block && hasActiveTourSession({ block, currentTourIndex: t.currentBlockIndex });
      });

      if (!someTourOutsideOfFirstStep) return;
      // oxlint-disable-next-line typescript/no-deprecated - we're intentionally using send event without event queue to avoid resuming a tour on retry
      void api.sendEventImmediately({
        name: "tour-session-heartbeat",
        blockIds: getRunningTours().flatMap((t) => {
          const block = blocksRef.current?.find((b) => b.blockStateId === t.blockStateId);
          if (!(block && hasActiveTourSession({ block, currentTourIndex: t.currentBlockIndex })))
            return [];
          return block.id;
        }),
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
      for (const tour of getRunningTours()) {
        const isOutsideOfFirstStep = tour.currentBlockIndex > 0;
        if (!isOutsideOfFirstStep) continue;
        const block = blocksRef.current?.find((b) => b.blockStateId === tour.blockStateId);
        if (!block) return;
        // oxlint-disable-next-line typescript/no-deprecated - we're intentionally using send event without event queue to use keepalive request
        void api.sendEventImmediately({
          name: "tour-session-hint",
          properties: { ending: true },
          blockId: block.id,
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

  const sendTourInterruptedEvent = useCallback((blockStateId: string): void => {
    const block = blocksRef.current?.find((b) => b.blockStateId === blockStateId);
    // If tour doesn't have a tourSessionEndAction, we don't need to send the event
    if (!block?.tourSessionEndAction) return;
    // oxlint-disable-next-line typescript/no-deprecated - we're intentionally using send event without event queue
    void api.sendEventImmediately({
      name: "tour-session-hint",
      properties: { interrupted: true },
      blockId: block.id,
    });
  }, []);

  const startTour = useCallback(
    (blockStateIds: string, options: { overrideOnlyRunning?: boolean } = {}) => {
      setRunningTourBlockStateIds((prev) => {
        if (prev.includes(blockStateIds)) return prev;
        return [...prev, blockStateIds];
      });

      if (options.overrideOnlyRunning) {
        const currentOnlyRunningTourBlockId = onlyRunningTourBlockStateIdRef.current;
        setOnlyRunningTourBlockStateId(blockStateIds);

        const tourWasInterrupted =
          currentOnlyRunningTourBlockId && currentOnlyRunningTourBlockId !== blockStateIds;
        if (tourWasInterrupted) {
          sendTourInterruptedEvent(currentOnlyRunningTourBlockId);
        }
      }
    },
    [sendTourInterruptedEvent],
  );

  const startToursIfNeeded = useCallback(
    (ctx: BlockTriggerContext): void => {
      if (!blocks) return;
      const tourBlocks = blocks.filter((b) => b.type === "tour");
      const runningTourBlockStateIds = new Set(runningToursRef.current.map((t) => t.blockStateId));
      const matchingTours = tourBlocks.filter((block) => {
        if (!block.blockStateId) return false;
        if (runningTourBlockStateIds.has(block.blockStateId)) return false;
        const triggerMatch = tourTriggerMatch(block, ctx);
        if (!triggerMatch) return false;

        return true;
      });

      const sortedTours = sortToursByPriority(matchingTours);
      sortedTours.forEach((block, index) => {
        if (!block.blockStateId) return;
        // Only highest priority tours is eligible for overrideOnlyRunning
        if (index === 0 && shouldTourOverrideOnlyRunning(block)) {
          startTour(block.blockStateId, { overrideOnlyRunning: true });
        } else {
          startTour(block.blockStateId);
        }
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
    const setCurrentBlockIndex = (blockStateId: string, value: number): void => {
      setRunningTours((prev) =>
        prev.map((tour) => {
          if (tour.blockStateId !== blockStateId) return tour;
          return { ...tour, currentBlockIndex: value };
        }),
      );
    };

    return runningTours
      .map(({ blockStateId, currentBlockIndex }): RunningTour | undefined => {
        const block = blocks.find((b) => b.blockStateId === blockStateId);
        if (!block) return;
        const blockId = block.id;

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
              setCurrentBlockIndex(blockStateId, newIndex);
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
            setCurrentBlockIndex(blockStateId, newIndex);
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

  // Set onlyRunningTourBlockId to the highest priority running tour
  useEffect(() => {
    if (tourConcurrency || onlyRunningTourBlockStateId) return;

    const highestPriorityTour = getHighestPriorityRunningTour(runningToursWithActiveBlock);
    if (highestPriorityTour) {
      setOnlyRunningTourBlockStateId(highestPriorityTour.blockStateId);
    }
  }, [runningToursWithActiveBlock, tourConcurrency, onlyRunningTourBlockStateId]);
  // Clear onlyRunningTourBlockId if the tour is no longer running
  useEffect(() => {
    if (!onlyRunningTourBlockStateId) return;
    const isRunning = runningTours.some(
      (tour) => tour.blockStateId === onlyRunningTourBlockStateId,
    );
    if (!isRunning) setOnlyRunningTourBlockStateId(undefined);
  }, [runningTours, onlyRunningTourBlockStateId]);

  const onlyRunningTours = useMemo(() => {
    if (tourConcurrency || !onlyRunningTourBlockStateId) return runningToursWithActiveBlock;
    return runningToursWithActiveBlock.filter(
      (tour) => tour.block.blockStateId === onlyRunningTourBlockStateId,
    );
  }, [runningToursWithActiveBlock, tourConcurrency, onlyRunningTourBlockStateId]);

  return onlyRunningTours;
};
