import { type ActiveBlock, type Block } from "@flows/shared";
import { type RunningTour } from "../flows-context";
import { sendEvent } from "./api";

export const blockToActiveBlock = (block: Block): ActiveBlock | [] => {
  if (!block.componentType) return [];

  const processData = ({
    properties,
    parentKey,
  }: {
    properties: Record<string, unknown>;
    parentKey?: string;
  }): Record<string, unknown> => {
    const _data = { ...properties };

    // Recursively process nested objects
    Object.entries(properties).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        _data[key] = value.map((item: Record<string, unknown>, index) => {
          if (typeof item === "object") {
            return processData({
              properties: item,
              parentKey: [parentKey, key, index].filter((x) => x !== undefined).join("."),
            });
          }
          return item;
        });
      }
    });

    // Add exit node methods
    delete _data.f__exit_nodes;
    (properties.f__exit_nodes as string[] | undefined)?.forEach((exitNode) => {
      _data[exitNode] = () =>
        sendEvent({
          name: "transition",
          propertyKey: [parentKey, exitNode].filter((x) => x !== undefined).join("."),
          blockId: block.id,
        });
    });

    return _data;
  };

  const data = processData({ properties: block.data });

  const methods = block.exitNodes.reduce<Record<string, () => Promise<void>>>((acc, exitNode) => {
    acc[exitNode] = () =>
      sendEvent({ name: "transition", blockId: block.id, propertyKey: exitNode });
    return acc;
  }, {});

  return {
    id: block.id,
    type: "component",
    component: block.componentType,
    props: {
      __flows: {
        key: block.key,
      },
      ...data,
      ...methods,
    },
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
