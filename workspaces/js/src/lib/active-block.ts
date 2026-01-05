import {
  type Block,
  type ActiveBlock,
  createComponentProps,
  type SetStateMemory,
  createActiveBlockProxy,
  createTourComponentProps,
  type UserProperties,
} from "@flows/shared";
import { removeBlock, updateBlock } from "../store";
import { nextTourStep, previousTourStep, cancelTour } from "./tour";
import { sendActivate, sendEvent } from "./api";

export const blockToActiveBlock = ({
  block,
  userProperties,
}: {
  block: Block;
  userProperties: UserProperties;
}): ActiveBlock | [] => {
  if (!block.componentType) return [];

  const setStateMemory: SetStateMemory = async ({ blockId, key, value }) => {
    updateBlock(blockId, (b) => ({
      ...b,
      propertyMeta: b.propertyMeta?.map((sp) => {
        if (sp.type === "state-memory" && sp.key === key) return { ...sp, value };
        return sp;
      }),
    }));

    await sendEvent({
      name: "set-state-memory",
      blockId,
      propertyKey: key,
      properties: { value },
    });
  };

  const props = createComponentProps({
    block,
    userProperties,
    removeBlock,
    exitNodeCb: ({ key, blockId }) => sendEvent({ name: "transition", blockId, propertyKey: key }),
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

export const tourToActiveBlock = ({
  block,
  currentIndex,
  userProperties,
}: {
  block: Block;
  currentIndex: number;
  userProperties: UserProperties;
}): ActiveBlock | [] => {
  const tourBlocks = block.tourBlocks;
  if (!tourBlocks?.length) return [];
  const activeStep = tourBlocks.at(currentIndex);
  if (!activeStep?.componentType) return [];

  const props = createTourComponentProps({
    tourSteps: tourBlocks,
    tourStep: activeStep,
    currentIndex,
    userProperties,
    handleContinue: () => {
      nextTourStep(block, currentIndex);
    },
    handlePrevious: () => {
      previousTourStep(block, currentIndex);
    },
    handleCancel: () => {
      cancelTour(block.id);
    },
  });

  const activeBlock: ActiveBlock = {
    id: activeStep.id,
    tourBlockId: block.id,
    type: "tour-component",
    component: activeStep.componentType,
    props,
  };

  return createActiveBlockProxy(activeBlock, sendActivate);
};
