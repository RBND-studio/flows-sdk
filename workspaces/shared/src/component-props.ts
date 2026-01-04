import { set } from "es-toolkit/compat";
import {
  type ComponentProps,
  type Block,
  type StateMemory,
  type Action,
  type TourComponentProps,
  type TourStep,
  type UserProperties,
} from "./types";
import { template } from "./template";

export type SetStateMemory = (props: {
  key: string;
  value: boolean;
  blockId: string;
}) => Promise<void>;
export type ExitNodeCb = (props: { key: string; blockId: string }) => Promise<void>;

export const createComponentProps = (props: {
  block: Block;
  removeBlock: (blockId: string) => void;
  exitNodeCb: ExitNodeCb;
  setStateMemory: SetStateMemory;
  userProperties: UserProperties;
}): ComponentProps<object> => {
  const { block, exitNodeCb, removeBlock, setStateMemory } = props;

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

      if (typeof value === "string") {
        _data[key] = template(value, props.userProperties);
      }
    });

    // Add exit node methods
    delete _data.f__exit_nodes;
    (properties.f__exit_nodes as string[] | undefined)?.forEach((exitNode) => {
      const cb = (): Promise<void> =>
        exitNodeCb({
          key: [parentKey, exitNode].filter((x) => x !== undefined).join("."),
          blockId: block.id,
        });
      _data[exitNode] = cb;
    });

    return _data;
  };

  const data = processData({ properties: block.data });

  for (const propMeta of block.propertyMeta ?? []) {
    if (propMeta.type === "state-memory") {
      const stateMemoryValue: StateMemory = {
        value: propMeta.value,
        setValue: (value: boolean) => {
          void setStateMemory({ key: propMeta.key, value, blockId: block.id });
        },
        triggers: propMeta.triggers ?? [],
      };
      set(data, propMeta.key, stateMemoryValue);
    }
    if (propMeta.type === "block-state") {
      const blockStateProps = createComponentProps({
        ...props,
        block: propMeta.value,
      });
      set(data, propMeta.key, blockStateProps);
    }
    if (propMeta.type === "action") {
      const actionValue = propMeta.value;

      const propValue: Action = {
        label: template(actionValue.label, props.userProperties),
        openInNew: actionValue.openInNew,
      };
      if (actionValue.url !== undefined) {
        propValue.url = template(actionValue.url, props.userProperties);
      }

      const exitNode = actionValue.exitNode;
      if (exitNode) {
        propValue.callAction = () => {
          // Don't remove block for block triggers
          if (block.exitNodes.includes(exitNode)) removeBlock(block.id);
          return exitNodeCb({ key: exitNode, blockId: block.id });
        };
      }

      set(data, propMeta.key, propValue);
    }
  }

  const methods = block.exitNodes.reduce<Record<string, () => Promise<void>>>((acc, exitNode) => {
    const cb = (): Promise<void> => {
      removeBlock(block.id);
      return exitNodeCb({ key: exitNode, blockId: block.id });
    };
    acc[exitNode] = cb;
    return acc;
  }, {});

  return {
    __flows: {
      id: block.id,
      key: block.key,
      workflowId: block.workflowId,
    },
    ...data,
    ...methods,
  };
};

export const createTourComponentProps = ({
  tourSteps,
  tourStep,
  currentIndex,
  handleCancel,
  handleContinue,
  handlePrevious,
}: {
  tourSteps: TourStep[];
  tourStep: TourStep;
  currentIndex: number;
  handleContinue: () => void;
  handlePrevious: () => void;
  handleCancel: () => void;
}): TourComponentProps<object> => {
  const isFirstStep = currentIndex === 0;

  const data = { ...tourStep.data };

  for (const propMeta of tourStep.propertyMeta ?? []) {
    if (propMeta.type === "action") {
      const actionValue = propMeta.value;

      const propValue: Action = {
        label: actionValue.label,
        url: actionValue.url,
        openInNew: actionValue.openInNew,
      };

      if (actionValue.exitNode) {
        // eslint-disable-next-line @typescript-eslint/require-await -- needed for the callAction to return Promise
        propValue.callAction = async () => {
          if (actionValue.exitNode === "continue") handleContinue();
          if (actionValue.exitNode === "previous") handlePrevious();
          if (actionValue.exitNode === "cancel") handleCancel();
        };
      }

      set(data, propMeta.key, propValue);
    }
  }

  const visibleTourSteps = tourSteps.filter((s) => s.type === "tour-component");
  const tourVisibleStepIndex = visibleTourSteps.findIndex((s) => s.id === tourStep.id);

  return {
    __flows: {
      id: tourStep.id,
      key: tourStep.key,
      workflowId: tourStep.workflowId,
      tourVisibleStepCount: visibleTourSteps.length,
      tourVisibleStepIndex,
    },
    ...data,
    continue: handleContinue,
    previous: !isFirstStep ? handlePrevious : undefined,
    cancel: handleCancel,
  };
};
