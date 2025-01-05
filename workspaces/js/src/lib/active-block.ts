import { type Block, getApi } from "@flows/shared";
import { type ActiveBlock } from "../types/active-block";
import { config, type RunningTour, runningTours } from "../store";

const sendEvent = async (props: {
  name: "transition" | "tour-update";
  blockId: string;
  propertyKey?: string;
  properties?: Record<string, unknown>;
}): Promise<void> => {
  const configuration = config.value;
  if (!configuration) return;
  const { environment, organizationId, userId, apiUrl } = configuration;
  await getApi(apiUrl).sendEvent({
    ...props,
    environment,
    organizationId,
    userId,
  });
};

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

  const updateState = (updateFn: (tour: RunningTour) => RunningTour): void => {
    runningTours.value = runningTours.value.map((tour) =>
      tour.blockId === block.id ? updateFn(tour) : tour,
    );
  };
  const hide = (): void => {
    updateState((t) => ({ ...t, hidden: true }));
  };

  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === tourBlocks.length - 1;

  const handlePrevious = (): void => {
    if (isFirstStep) return;
    const newIndex = currentIndex - 1;
    updateState((t) => ({ ...t, currentBlockIndex: newIndex }));
    void sendEvent({
      name: "tour-update",
      blockId: block.id,
      properties: { currentTourIndex: newIndex },
    });
  };
  const handleContinue = (): void => {
    if (isLastStep) {
      hide();
      void sendEvent({ name: "transition", blockId: block.id, propertyKey: "complete" });
    } else {
      const newIndex = currentIndex + 1;
      updateState((t) => ({ ...t, currentBlockIndex: newIndex }));
      void sendEvent({
        name: "tour-update",
        blockId: block.id,
        properties: { currentTourIndex: newIndex },
      });
    }
  };
  const handleCancel = (): void => {
    hide();
    void sendEvent({ name: "transition", blockId: block.id, propertyKey: "cancel" });
  };

  return {
    id: activeStep.id,
    type: "tour-component",
    component: activeStep.componentType,
    props: {
      ...activeStep.data,
      previous: handlePrevious,
      continue: handleContinue,
      cancel: handleCancel,
    },
  };
};
