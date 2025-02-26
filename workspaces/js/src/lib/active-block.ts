import { type Block, type ActiveBlock } from "@flows/shared";
import { nextTourStep, previousTourStep, cancelTour } from "./tour";
import { sendEvent } from "./api";

export const blockToActiveBlock = (block: Block): ActiveBlock | [] => {
  if (!block.componentType) return [];

  const data = block.data;
  const methods = block.exitNodes.reduce<Record<string, () => Promise<void>>>((acc, exitNode) => {
    acc[exitNode] = () =>
      sendEvent({ name: "transition", blockId: block.id, propertyKey: exitNode });
    return acc;
  }, {});

  return {
    id: block.id,
    type: "component",
    component: block.componentType,
    props: { ...data, ...methods },
  };
};

export const tourToActiveBlock = (block: Block, currentIndex: number): ActiveBlock | [] => {
  const tourBlocks = block.tourBlocks;
  if (!tourBlocks?.length) return [];
  const activeStep = tourBlocks.at(currentIndex);
  if (!activeStep?.componentType) return [];

  const isFirstStep = currentIndex === 0;

  const handlePrevious = (): void => {
    previousTourStep(block, currentIndex);
  };
  const handleContinue = (): void => {
    nextTourStep(block, currentIndex);
  };
  const handleCancel = (): void => {
    cancelTour(block.id);
  };

  return {
    id: activeStep.id,
    type: "tour-component",
    component: activeStep.componentType,
    props: {
      ...activeStep.data,
      previous: !isFirstStep ? handlePrevious : undefined,
      continue: handleContinue,
      cancel: handleCancel,
    },
  };
};
