import {
  type Block,
  type ActiveBlock,
  createComponentProps,
  type SetStateMemory,
  createActiveBlockProxy,
} from "@flows/shared";
import { removeBlock, updateBlock } from "../store";
import { nextTourStep, previousTourStep, cancelTour } from "./tour";
import { sendActivate, sendEvent } from "./api";

export const blockToActiveBlock = (block: Block): ActiveBlock | [] => {
  if (!block.componentType) return [];

  const setStateMemory: SetStateMemory = async (key, value) => {
    updateBlock(block.id, (b) => ({
      ...b,
      propertyMeta: b.propertyMeta?.map((sp) => {
        if (sp.type === "state-memory" && sp.key === key) return { ...sp, value };
        return sp;
      }),
    }));

    await sendEvent({
      name: "set-state-memory",
      blockId: block.id,
      propertyKey: key,
      properties: { value },
    });
  };

  const props = createComponentProps({
    block,
    removeBlock,
    exitNodeCb: (key) => sendEvent({ name: "transition", blockId: block.id, propertyKey: key }),
    setStateMemory,
  });

  const activeBlock: ActiveBlock = {
    id: block.id,
    type: "component",
    component: block.componentType,
    props,
  };

  return createActiveBlockProxy(activeBlock, sendActivate);
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

  const activeBlock: ActiveBlock = {
    id: activeStep.id,
    tourBlockId: block.id,
    type: "tour-component",
    component: activeStep.componentType,
    props: {
      __flows: {
        id: activeStep.id,
        key: activeStep.key,
        workflowId: activeStep.workflowId,
      },
      ...activeStep.data,
      previous: !isFirstStep ? handlePrevious : undefined,
      continue: handleContinue,
      cancel: handleCancel,
    },
  };

  return createActiveBlockProxy(activeBlock, sendActivate);
};
