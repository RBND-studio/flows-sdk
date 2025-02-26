import { type FC, useMemo } from "react";
import { type ActiveBlock, type Block as IBlock, pathnameMatch } from "@flows/shared";
import { type RunningTour, useFlowsContext } from "../flows-context";
import { usePathname } from "../contexts/pathname-context";
import { Block } from "./block";
import { TourBlock } from "./tour-block";

const blockToActiveBlock = (block: IBlock): ActiveBlock | [] => {
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
      // TODO:
      // _data[exitNode] = () =>
      //   sendEvent({
      //     name: "transition",
      //     exitNode: [parentKey, exitNode].filter((x) => x !== undefined).join("."),
      //     blockId: block.id,
      //   });
    });

    return _data;
  };

  const data = processData({ properties: block.data });

  // TODO:
  // const methods = block.exitNodes.reduce<Record<string, () => Promise<void>>>((acc, exitNode) => {
  //   acc[exitNode] = () =>
  //     sendEvent({ name: "transition", blockId: block.id, propertyKey: exitNode });
  //   return acc;
  // }, {});
  const methods = {};

  return {
    component: block.componentType,
    id: block.id,
    type: "component",
    props: { ...data, ...methods },
  };
};

const tourBlockToActiveBlock = (tour: RunningTour): ActiveBlock | [] => {
  const activeStep = tour.activeStep;
  if (!activeStep?.componentType) return [];

  const isFirstStep = tour.currentBlockIndex === 0;

  return {
    component: activeStep.componentType,
    id: activeStep.id,
    type: "tour-component",
    props: {
      ...activeStep.data,
      continue: tour.continue,
      previous: !isFirstStep ? tour.previous : undefined,
      cancel: tour.cancel,
    },
  };
};

const useVisibleBlocks = (): IBlock[] => {
  const { blocks } = useFlowsContext();
  const pathname = usePathname();
  return useMemo(
    () =>
      blocks.filter((b) =>
        pathnameMatch({
          pathname,
          operator: b.page_targeting_operator,
          value: b.page_targeting_values,
        }),
      ),
    [blocks, pathname],
  );
};
const useVisibleTours = (): RunningTour[] => {
  const { runningTours } = useFlowsContext();
  const pathname = usePathname();
  return useMemo(
    () =>
      runningTours.filter((tour) => {
        const activeStep = tour.activeStep;
        return (
          !tour.hidden &&
          activeStep &&
          pathnameMatch({
            pathname,
            operator: activeStep.page_targeting_operator,
            value: activeStep.page_targeting_values,
          })
        );
      }),
    [],
  );
};

const useCurrentFloatingBlocks = (): ActiveBlock[] => {
  const visibleBlocks = useVisibleBlocks();
  const visibleTours = useVisibleTours();

  const floatingBlocks = useMemo(
    () => visibleBlocks.filter((b) => !b.slottable).flatMap(blockToActiveBlock),
    [visibleBlocks],
  );
  const floatingTourBlocks = useMemo(
    () =>
      visibleTours
        .filter((tour) => {
          const activeStep = tour.activeStep;
          return activeStep && !activeStep.slottable;
        })
        .flatMap(tourBlockToActiveBlock),
    [visibleTours],
  );

  return [...floatingBlocks, ...floatingTourBlocks];
};

export const FloatingBlocks: FC = () => {
  const items = useCurrentFloatingBlocks();

  return (
    <>
      {items.map((item) => {
        if (item.type === "component") return <Block key={item.id} block={item} />;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it's better to be safe
        if (item.type === "tour-component") return <TourBlock key={item.id} block={item} />;
        return null;
      })}
    </>
  );
};
