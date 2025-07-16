import {
  elementContains,
  getPathname,
  pathnameMatch,
  tourTriggerMatch,
  type Block,
} from "@flows/shared";
import { effect } from "@preact/signals-core";
import {
  blocks,
  pathname,
  removeBlock,
  type RunningTour,
  runningTours,
  tourBlocks,
} from "../store";
import { sendEvent } from "./api";
import { debounce } from "es-toolkit";

const startToursIfNeeded = (
  tourBlocksValue: Block[],
  ctx: { pathname: string; event?: MouseEvent },
): void => {
  const runningTourBlockIds = new Set(runningTours.peek().map((t) => t.blockId));

  tourBlocksValue.forEach((block) => {
    if (runningTourBlockIds.has(block.id)) return;
    const triggerMatch = tourTriggerMatch(block.tour_trigger, ctx);
    if (!triggerMatch) return;

    runningTours.value = [
      ...runningTours.peek(),
      {
        blockId: block.id,
        currentBlockIndex: block.currentTourIndex ?? 0,
      },
    ];
  });
};

export const updateTourState = (
  tourBlockId: string,
  updateFn: (tour: RunningTour) => RunningTour,
): void => {
  runningTours.value = runningTours.value.map((tour) =>
    tour.blockId === tourBlockId ? updateFn(tour) : tour,
  );
};

export const previousTourStep = (tourBlock: Block, currentIndex: number): void => {
  const isFirstStep = currentIndex === 0;

  if (isFirstStep) return;
  const newIndex = currentIndex - 1;
  updateTourState(tourBlock.id, (t) => ({ ...t, currentBlockIndex: newIndex }));
  void sendEvent({
    name: "tour-update",
    blockId: tourBlock.id,
    properties: { currentTourIndex: newIndex },
  });
};

export const nextTourStep = (tourBlock: Block, currentIndex: number): void => {
  const isLastStep = currentIndex === (tourBlock.tourBlocks?.length ?? 1) - 1;

  if (isLastStep) {
    removeBlock(tourBlock.id);
    void sendEvent({ name: "transition", blockId: tourBlock.id, propertyKey: "complete" });
  } else {
    const newIndex = currentIndex + 1;
    updateTourState(tourBlock.id, (t) => ({ ...t, currentBlockIndex: newIndex }));
    void sendEvent({
      name: "tour-update",
      blockId: tourBlock.id,
      properties: { currentTourIndex: newIndex },
    });
  }
};

export const cancelTour = (tourBlockId: string): void => {
  removeBlock(tourBlockId);
  void sendEvent({ name: "transition", blockId: tourBlockId, propertyKey: "cancel" });
};

const handleTourClickWaits = (eventTarget: Element): void => {
  const blocksById = new Map(blocks.peek().map((block) => [block.id, block]));

  runningTours.value.forEach((tour) => {
    const tourBlock = blocksById.get(tour.blockId);
    if (!tourBlock) return;
    const activeStep = tourBlock.tourBlocks?.at(tour.currentBlockIndex);
    if (!activeStep) return;
    const tourWait = activeStep.tourWait;
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
  });
};

const timeoutByTourId = new Map<string, { timeoutId: number; stepId: string }>();

effect(() => {
  const pathnameValue = pathname.value;
  const runningToursValue = runningTours.value;
  const tourBlocksValue = tourBlocks.value;

  const tourBlockIds = new Map(tourBlocksValue.map((block) => [block.id, block]));

  runningToursValue.forEach((tour) => {
    const tourBlock = tourBlockIds.get(tour.blockId);
    if (!tourBlock) return;
    const activeStep = tourBlock.tourBlocks?.at(tour.currentBlockIndex);
    if (!activeStep) return;

    // Clear timeouts for tours that don't have active the wait step
    const existingTimeout = timeoutByTourId.get(tour.blockId);
    if (existingTimeout && existingTimeout.stepId !== activeStep.id) {
      clearTimeout(existingTimeout.timeoutId);
      timeoutByTourId.delete(tour.blockId);
    }

    const tourWait = activeStep.tourWait;
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
      !timeoutByTourId.has(tour.blockId)
    ) {
      const timeoutId = window.setTimeout(() => {
        nextTourStep(tourBlock, tour.currentBlockIndex);
        timeoutByTourId.delete(tour.blockId);
      }, tourWait.ms);
      timeoutByTourId.set(tour.blockId, { timeoutId, stepId: activeStep.id });
    }
  });
});

// Stop tours that are no longer running
effect(() => {
  const tourBlocksValue = tourBlocks.value;
  const tourBlockIds = new Set(tourBlocksValue.map((b) => b.id));

  // Filter out stopped tours
  runningTours.value = runningTours.peek().filter((tour) => {
    return tourBlockIds.has(tour.blockId);
  });
});

// Handle trigger by navigation
effect(() => {
  const tourBlocksValue = tourBlocks.value;
  const pathnameValue = pathname.value;

  if (!pathnameValue) return;

  startToursIfNeeded(tourBlocksValue, { pathname: pathnameValue });
});

// Handle trigger by DOM element
effect(() => {
  const tourBlocksValue = tourBlocks.value;

  const debouncedCallback = debounce(() => {
    startToursIfNeeded(tourBlocksValue, { pathname: getPathname() });
  }, 32);

  const observer = new MutationObserver(debouncedCallback);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  return () => {
    observer.disconnect();
  };
});
