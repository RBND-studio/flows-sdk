import type { BlockTriggerContext, UserProperties } from "@flows/shared";
import {
  elementContains,
  elementExists,
  elementNotExists,
  getHighestPriorityRunningTour,
  getPathname,
  hasActiveTourSession,
  pathnameMatch,
  processTourWait,
  setRunningToursToSessionStorage,
  shouldTourOverrideOnlyRunning,
  sortToursByPriority,
  tourTriggerMatch,
  type Block,
} from "@flows/shared";
import { effect } from "@preact/signals-core";
import { debounce } from "es-toolkit";
import {
  blocks,
  config,
  onlyRunningTourBlockStateId,
  pathname,
  removeBlock,
  type RunningTour,
  runningTourBlockStateIds,
  runningTours,
  tourBlocks,
  tourConcurrency,
} from "../store";
import { api } from "./api";

// Update "proxy" state with current tour index
effect(() => {
  const blocksValue = blocks.value;
  const runningTourBlockStateIdsValue = runningTourBlockStateIds.value;

  if (!blocksValue) {
    runningTours.value = [];
    return;
  }

  const blocksByStateId = new Map(blocksValue.map((b) => [b.blockStateId, b]));
  const prevById = new Map(runningTours.peek().map((t) => [t.blockStateId, t]));
  runningTours.value = runningTourBlockStateIdsValue.map((blockStateId) => {
    const prevState = prevById.get(blockStateId);
    if (prevState) return prevState;
    return {
      blockStateId,
      currentBlockIndex: blocksByStateId.get(blockStateId)?.currentTourIndex ?? 0,
    };
  });
});

// Update running tours in sessionStorage
effect(() => {
  if (typeof window === "undefined") return;

  const onlyRunningTourBlockStateIdValue = onlyRunningTourBlockStateId.value;
  const runningTourBlockStateIdsValues = runningTourBlockStateIds.value;

  setRunningToursToSessionStorage({
    runningTourBlockStateIds: runningTourBlockStateIdsValues,
    onlyRunningTourBlockStateId: onlyRunningTourBlockStateIdValue,
  });
});

// Send heartbeat for running tours outside of first step and send tour session hint on pagehide
effect(() => {
  if (typeof window === "undefined") return;

  const getRunningTours = () => {
    const onlyRunningTourBlockStateIdValue = onlyRunningTourBlockStateId.peek();
    const runningToursValue = runningTours.peek();

    if (!tourConcurrency.peek() && onlyRunningTourBlockStateIdValue) {
      const onlyRunningTourDef = runningToursValue.find(
        (t) => t.blockStateId === onlyRunningTourBlockStateIdValue,
      );
      if (onlyRunningTourDef) return [onlyRunningTourDef];
    }
    return runningToursValue;
  };

  const sendTourSessionHeartbeat = (): void => {
    const someTourOutsideOfFirstStep = getRunningTours().some((t) => {
      const block = tourBlocks.peek().find((b) => b.blockStateId === t.blockStateId);
      return block && hasActiveTourSession({ block, currentTourIndex: t.currentBlockIndex });
    });
    if (!someTourOutsideOfFirstStep) return;
    // oxlint-disable-next-line typescript/no-deprecated - we're intentionally using send event without event queue to avoid resuming a tour on retry
    void api.sendEventImmediately({
      name: "tour-session-heartbeat",
      blockIds: getRunningTours().flatMap((t) => {
        const block = tourBlocks.peek().find((b) => b.blockStateId === t.blockStateId);
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
      const block = tourBlocks.peek().find((b) => b.blockStateId === tour.blockStateId);
      if (!block) continue;
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
});

const sendTourInterruptedEvent = (blockStateId: string): void => {
  const block = tourBlocks.peek().find((b) => b.blockStateId === blockStateId);
  // If tour doesn't have a tourSessionEndAction, we don't need to send the event
  if (!block?.tourSessionEndAction) return;
  // oxlint-disable-next-line typescript/no-deprecated - we're intentionally using send event without event queue
  void api.sendEventImmediately({
    name: "tour-session-hint",
    properties: { interrupted: true },
    blockId: block.id,
  });
};

const startTour = (blockStateId: string, options: { overrideOnlyRunning?: boolean } = {}) => {
  const prevRunningIds = runningTourBlockStateIds.peek();
  if (!prevRunningIds.includes(blockStateId)) {
    runningTourBlockStateIds.value = [...prevRunningIds, blockStateId];
  }

  if (options.overrideOnlyRunning && !tourConcurrency.peek()) {
    const currentOnlyRunningTourBlockId = onlyRunningTourBlockStateId.peek();
    onlyRunningTourBlockStateId.value = blockStateId;

    const tourWasInterrupted =
      currentOnlyRunningTourBlockId && currentOnlyRunningTourBlockId !== blockStateId;
    if (tourWasInterrupted) {
      sendTourInterruptedEvent(currentOnlyRunningTourBlockId);
    }
  }
};

const startToursIfNeeded = (tourBlocksValue: Block[], ctx: BlockTriggerContext): void => {
  const runningTourBlockStateIds = new Set(runningTours.peek().map((t) => t.blockStateId));
  const matchingTours = tourBlocksValue.filter((block) => {
    if (!block.blockStateId) return false;
    if (runningTourBlockStateIds.has(block.blockStateId)) return false;
    const triggerMatch = tourTriggerMatch(block, ctx);
    if (!triggerMatch) return false;

    return true;
  });

  const sortedTours = sortToursByPriority(matchingTours);
  sortedTours.forEach((block, index) => {
    if (!block.blockStateId) return;
    // Only the highest priority tour is eligible for overrideOnlyRunning
    if (index === 0 && shouldTourOverrideOnlyRunning(block)) {
      startTour(block.blockStateId, { overrideOnlyRunning: true });
    } else {
      startTour(block.blockStateId);
    }
  });
};

export const updateTourState = (
  blockStateId: string,
  updateFn: (tour: RunningTour) => RunningTour,
): void => {
  runningTours.value = runningTours.value.map((tour) =>
    tour.blockStateId === blockStateId ? updateFn(tour) : tour,
  );
};

export const previousTourStep = (tourBlock: Block, currentIndex: number): void => {
  const isFirstStep = currentIndex === 0;

  if (isFirstStep) return;
  const newIndex = currentIndex - 1;
  void api.sendEvent({
    name: "tour-update",
    blockId: tourBlock.id,
    properties: { currentTourIndex: newIndex },
  });

  // Update the step with a timeout to avoid navigation with href from the previous step
  setTimeout(() => {
    if (tourBlock.blockStateId)
      updateTourState(tourBlock.blockStateId, (t) => ({ ...t, currentBlockIndex: newIndex }));
  }, 0);
};

export const nextTourStep = (tourBlock: Block, currentIndex: number): void => {
  const isLastStep = currentIndex === (tourBlock.tourBlocks?.length ?? 1) - 1;

  if (isLastStep) {
    removeBlock(tourBlock.id);
    void api.sendEvent({ name: "transition", blockId: tourBlock.id, propertyKey: "complete" });
  } else {
    const newIndex = currentIndex + 1;
    void api.sendEvent({
      name: "tour-update",
      blockId: tourBlock.id,
      properties: { currentTourIndex: newIndex },
    });

    // Update the step with a timeout to avoid navigation with href from the next step
    setTimeout(() => {
      if (tourBlock.blockStateId)
        updateTourState(tourBlock.blockStateId, (t) => ({ ...t, currentBlockIndex: newIndex }));
    }, 0);
  }
};

export const cancelTour = (tourBlockId: string): void => {
  removeBlock(tourBlockId);
  void api.sendEvent({ name: "transition", blockId: tourBlockId, propertyKey: "cancel" });
};

const handleTourClickWaits = (eventTarget: Element): void => {
  const blocksByStateId = new Map(tourBlocks.peek().map((block) => [block.blockStateId, block]));

  runningTours.value.forEach((tour) => {
    const tourBlock = blocksByStateId.get(tour.blockStateId);
    if (!tourBlock) return;
    const activeStep = tourBlock.tourBlocks?.at(tour.currentBlockIndex);
    if (!activeStep) return;
    const tourWait = processTourWait(activeStep.tourWait, config.peek()?.userProperties ?? {});
    if (!tourWait) return;

    if (tourWait.interaction === "click") {
      const pageMatch = pathnameMatch({
        pathname: getPathname(),
        operator: tourWait.page?.operator,
        value: tourWait.page?.value,
      });
      const clickMatch = elementContains({ eventTarget, value: tourWait.element });
      if (clickMatch && pageMatch) {
        nextTourStep(tourBlock, tour.currentBlockIndex);
      }
    }
  });
};

export const handleTourDocumentClick = (event: MouseEvent): void => {
  const eventTarget = event.target;
  // Handle running tours click waits
  // The order here is important, otherwise the tour could be started and proceeded with wait by the same click event
  if (eventTarget instanceof Element) {
    handleTourClickWaits(eventTarget);
  }

  // Handle trigger by click
  startToursIfNeeded(tourBlocks.value, {
    pathname: getPathname(),
    event,
    userProperties: config.peek()?.userProperties ?? {},
  });
};

const timeoutByTourStateId = new Map<string, { timeoutId: number; stepId: string }>();

effect(() => {
  const pathnameValue = pathname.value;
  const runningToursValue = runningTours.value;
  const tourBlocksValue = tourBlocks.value;
  const configValue = config.value;

  const tourBlockStateIds = new Map(tourBlocksValue.map((block) => [block.blockStateId, block]));

  runningToursValue.forEach((tour) => {
    const tourBlock = tourBlockStateIds.get(tour.blockStateId);
    if (!tourBlock) return;
    const activeStep = tourBlock.tourBlocks?.at(tour.currentBlockIndex);
    if (!activeStep) return;

    // Clear timeouts for tours that don't have active the wait step
    const existingTimeout = timeoutByTourStateId.get(tour.blockStateId);
    if (existingTimeout && existingTimeout.stepId !== activeStep.id) {
      clearTimeout(existingTimeout.timeoutId);
      timeoutByTourStateId.delete(tour.blockStateId);
    }

    const tourWait = processTourWait(activeStep.tourWait, configValue?.userProperties ?? {});
    if (!tourWait) return;

    // Handle navigation waits
    if (tourWait.interaction === "navigation") {
      const match = pathnameMatch({
        pathname: pathnameValue,
        operator: tourWait.page?.operator,
        value: tourWait.page?.value,
      });

      if (match) nextTourStep(tourBlock, tour.currentBlockIndex);
    }

    // Handle delay waits
    if (
      tourWait.interaction === "delay" &&
      tourWait.ms !== undefined &&
      !timeoutByTourStateId.has(tour.blockStateId)
    ) {
      const timeoutId = window.setTimeout(() => {
        nextTourStep(tourBlock, tour.currentBlockIndex);
        timeoutByTourStateId.delete(tour.blockStateId);
      }, tourWait.ms);
      timeoutByTourStateId.set(tour.blockStateId, { timeoutId, stepId: activeStep.id });
    }
  });
});

// Stop tours that are no longer running
effect(() => {
  const blocksValue = blocks.value;
  if (!blocksValue) return;

  const tourBlockIds = new Set(
    blocksValue.filter((b) => b.type === "tour").map((b) => b.blockStateId),
  );

  // Filter out stopped tours
  runningTourBlockStateIds.value = runningTourBlockStateIds
    .peek()
    .filter((blockStateId) => tourBlockIds.has(blockStateId));
});

// Handle trigger by navigation
effect(() => {
  const tourBlocksValue = tourBlocks.value;
  const pathnameValue = pathname.value;
  const configValue = config.value;

  if (!pathnameValue) return;

  startToursIfNeeded(tourBlocksValue, {
    pathname: pathnameValue,
    userProperties: configValue?.userProperties ?? {},
  });
});

const handleTourElementWaits = (tours: RunningTour[], userProperties: UserProperties): void => {
  const blocksByStateId = new Map(tourBlocks.peek().map((block) => [block.blockStateId, block]));

  tours.forEach((tour) => {
    const tourBlock = blocksByStateId.get(tour.blockStateId);
    if (!tourBlock) return;
    const activeStep = tourBlock.tourBlocks?.at(tour.currentBlockIndex);
    if (!activeStep) return;
    const tourWait = processTourWait(activeStep.tourWait, userProperties);
    if (!tourWait) return;
    const waitElement = tourWait.element;

    if (tourWait.interaction === "dom-element") {
      const pageMatch = pathnameMatch({
        pathname: getPathname(),
        operator: tourWait.page?.operator,
        value: tourWait.page?.value,
      });
      const domElementMatch = elementExists(waitElement);
      if (domElementMatch && pageMatch) nextTourStep(tourBlock, tour.currentBlockIndex);
    }
    if (tourWait.interaction === "not-dom-element") {
      const pageMatch = pathnameMatch({
        pathname: getPathname(),
        operator: tourWait.page?.operator,
        value: tourWait.page?.value,
      });
      const notDomElementMatch = elementNotExists(waitElement);
      if (notDomElementMatch && pageMatch) nextTourStep(tourBlock, tour.currentBlockIndex);
    }
  });
};

// Handle trigger and wait by DOM element
effect(() => {
  // Ensure this effect runs only in the browser environment because of the MutationObserver
  if (typeof window === "undefined") return;

  const tourBlocksValue = tourBlocks.value;
  const runningToursValue = runningTours.value;
  const configValue = config.value;

  const callback = (): void => {
    startToursIfNeeded(tourBlocksValue, {
      pathname: getPathname(),
      userProperties: configValue?.userProperties ?? {},
    });
    handleTourElementWaits(runningToursValue, configValue?.userProperties ?? {});
  };

  const debouncedCallback = debounce(callback, 32);

  const observer = new MutationObserver(debouncedCallback);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  // Run once to catch existing elements
  debouncedCallback();
  return () => {
    observer.disconnect();
  };
});

// Set onlyRunningTourBlockId to the highest priority running tour
effect(() => {
  const runningToursValue = runningTours.value;
  const tourConcurrencyValue = tourConcurrency.value;
  const onlyRunningTourBlockStateIdValue = onlyRunningTourBlockStateId.value;
  const tourBlocksValue = tourBlocks.value;

  if (tourConcurrencyValue || onlyRunningTourBlockStateIdValue) return;

  const blocksByStateId = new Map(tourBlocksValue.map((b) => [b.blockStateId, b]));
  const highestPriorityTour = getHighestPriorityRunningTour(
    runningToursValue.flatMap((tour) => {
      const block = blocksByStateId.get(tour.blockStateId);
      if (!block) return [];
      const activeStep = block.tourBlocks?.[tour.currentBlockIndex];
      return { block, activeStep };
    }),
  );
  if (highestPriorityTour) {
    onlyRunningTourBlockStateId.value = highestPriorityTour.blockStateId;
  }
});
// Clear onlyRunningTourBlockId if the tour is no longer running
effect(() => {
  const onlyRunningTourBlockStateIdValue = onlyRunningTourBlockStateId.value;
  const runningToursValue = runningTours.value;

  if (!onlyRunningTourBlockStateIdValue) return;
  const isRunning = runningToursValue.some(
    (tour) => tour.blockStateId === onlyRunningTourBlockStateIdValue,
  );
  if (!isRunning) onlyRunningTourBlockStateId.value = undefined;
});
