import { createComponentProps, type ActiveBlock, type Block } from "@flows/shared";
import { type RunningTour } from "../flows-context";
import { sendEvent } from "./api";

export const blockToActiveBlock = (block: Block): ActiveBlock | [] => {
  if (!block.componentType) return [];

  const props = createComponentProps({
    block,
    exitNodeCb: (key) => sendEvent({ name: "transition", blockId: block.id, propertyKey: key }),
  });

  return {
    id: block.id,
    type: "component",
    component: block.componentType,
    props,
  };
};

export const tourBlockToActiveBlock = (tour: RunningTour): ActiveBlock | [] => {
  const activeStep = tour.activeStep;
  if (!activeStep?.componentType) return [];

  const isFirstStep = tour.currentBlockIndex === 0;

  return {
    id: activeStep.id,
    type: "tour-component",
    component: activeStep.componentType,
    props: {
      __flows: {
        key: activeStep.key,
      },
      ...activeStep.data,
      continue: tour.continue,
      previous: !isFirstStep ? tour.previous : undefined,
      cancel: tour.cancel,
    },
  };
};
