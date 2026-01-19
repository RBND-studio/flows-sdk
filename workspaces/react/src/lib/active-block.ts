import {
  createComponentProps,
  type SetStateMemory,
  type ActiveBlock,
  type Block,
  createActiveBlockProxy,
  createTourComponentProps,
  type UserProperties,
  type LinkComponentType,
} from "@flows/shared";
import { type RemoveBlock, type UpdateBlock, type RunningTour } from "../flows-context";
import { sendActivate, sendEvent } from "./api";

export const blockToActiveBlock = ({
  block,
  removeBlock,
  updateBlock,
  userProperties,
  LinkComponent,
}: {
  block: Block;
  removeBlock: RemoveBlock;
  updateBlock: UpdateBlock;
  userProperties: UserProperties;
  LinkComponent?: LinkComponentType;
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
    LinkComponent,
  });

  const activeBlock: ActiveBlock = {
    id: block.id,
    type: "component",
    component: block.componentType,
    props,
  };

  return createActiveBlockProxy(activeBlock, sendActivate);
};

export const tourBlockToActiveBlock = ({
  tour,
  userProperties,
  LinkComponent,
}: {
  tour: RunningTour;
  userProperties: UserProperties;
  LinkComponent?: LinkComponentType;
}): ActiveBlock | [] => {
  const activeStep = tour.activeStep;
  if (!activeStep?.componentType) return [];

  const props = createTourComponentProps({
    tourSteps: tour.block.tourBlocks ?? [],
    tourStep: activeStep,
    currentIndex: tour.currentBlockIndex,
    userProperties,
    handleCancel: tour.cancel,
    handleContinue: tour.continue,
    handlePrevious: tour.previous,
    LinkComponent,
  });

  const activeBlock: ActiveBlock = {
    id: activeStep.id,
    tourBlockId: tour.block.id,
    type: "tour-component",
    component: activeStep.componentType,
    props,
  };

  return createActiveBlockProxy(activeBlock, sendActivate);
};
