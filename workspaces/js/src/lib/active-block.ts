import { type Block, type ActiveBlock, createComponentProps } from "@flows/shared";
import { removeBlock } from "../store";
import { nextTourStep, previousTourStep, cancelTour } from "./tour";
import { sendEvent } from "./api";

export const blockToActiveBlock = (block: Block): ActiveBlock | [] => {
  if (!block.componentType) return [];

  const props = createComponentProps({
    block,
    removeBlock,
    exitNodeCb: (key) => sendEvent({ name: "transition", blockId: block.id, propertyKey: key }),
  });

  return {
    id: block.id,
    type: "component",
    component: block.componentType,
    props,
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
      __flows: {
        key: activeStep.key,
      },
      ...activeStep.data,
      previous: !isFirstStep ? handlePrevious : undefined,
      continue: handleContinue,
      cancel: handleCancel,
    },
  };
};
