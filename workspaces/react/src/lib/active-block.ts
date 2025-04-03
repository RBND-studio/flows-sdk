import {
  createComponentProps,
  type SetStateMemory,
  type ActiveBlock,
  type Block,
  createActiveBlockProxy,
} from "@flows/shared";
import { type RemoveBlock, type UpdateBlock, type RunningTour } from "../flows-context";
import { sendActivate, sendEvent } from "./api";

export const blockToActiveBlock = ({
  block,
  removeBlock,
  updateBlock,
}: {
  block: Block;
  removeBlock: RemoveBlock;
  updateBlock: UpdateBlock;
}): ActiveBlock | [] => {
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

export const tourBlockToActiveBlock = (tour: RunningTour): ActiveBlock | [] => {
  const activeStep = tour.activeStep;
  if (!activeStep?.componentType) return [];

  const isFirstStep = tour.currentBlockIndex === 0;

  const activeBlock: ActiveBlock = {
    id: activeStep.id,
    tourBlockId: tour.block.id,
    type: "tour-component",
    component: activeStep.componentType,
    props: {
      __flows: {
        key: activeStep.key,
        workflowId: activeStep.workflowId,
      },
      ...activeStep.data,
      continue: tour.continue,
      previous: !isFirstStep ? tour.previous : undefined,
      cancel: tour.cancel,
    },
  };

  return createActiveBlockProxy(activeBlock, sendActivate);
};
