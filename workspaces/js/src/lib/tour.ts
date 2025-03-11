import { elementContains, getPathname, pathnameMatch, type Block } from "@flows/shared";
import { effect } from "@preact/signals-core";
import { blocks, pathname, removeBlock, type RunningTour, runningTours } from "../store";
import { sendEvent } from "./api";

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

export const handleTourDocumentClick = (eventTarget: Element): void => {
  const currentPathname = getPathname();

  const blocksById = new Map(blocks.value.map((block) => [block.id, block]));
  runningTours.value.forEach((tour) => {
    const tourBlock = blocksById.get(tour.blockId);
    if (!tourBlock) return;
    const activeStep = tourBlock.tourBlocks?.at(tour.currentBlockIndex);
    if (!activeStep) return;
    const tourWait = activeStep.tourWait;
    if (!tourWait) return;

    if (tourWait.interaction === "click") {
      const pageMatch = pathnameMatch({
        pathname: currentPathname,
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

const timeoutByTourId = new Map<string, { timeoutId: number; stepId: string }>();

effect(() => {
  const pathnameValue = pathname.value;
  const blocksValue = blocks.value;
  const runningToursValue = runningTours.value;

  const blocksById = new Map(blocksValue.map((block) => [block.id, block]));

  runningToursValue.forEach((tour) => {
    const tourBlock = blocksById.get(tour.blockId);
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
