import { set } from "es-toolkit/compat";
import { mapValues } from "es-toolkit";
import {
  type ComponentProps,
  type Block,
  type StateMemory,
  type Action,
  type TourComponentProps,
  type TourStep,
  type UserProperties,
  type PropertyMeta,
  type LinkComponentType,
} from "./types";
import { template } from "./template";

export type SetStateMemory = (props: {
  key: string;
  value: boolean;
  blockId: string;
}) => Promise<void>;
export type ExitNodeCb = (props: { key: string; blockId: string }) => Promise<void>;

const createActionBase = ({
  propMeta,
  userProperties,
}: {
  propMeta: PropertyMeta & { type: "action" };
  userProperties: UserProperties;
}): Action => {
  const actionValue = propMeta.value;

  const propValue: Action = {
    label: template(actionValue.label, userProperties),
    openInNew: actionValue.openInNew,
  };
  if (actionValue.url !== undefined) {
    propValue.url = template(actionValue.url, userProperties);
  }

  return propValue;
};

export const createComponentProps = (props: {
  block: Block;
  removeBlock: (blockId: string) => void;
  exitNodeCb: ExitNodeCb;
  setStateMemory: SetStateMemory;
  userProperties: UserProperties;
  LinkComponent?: LinkComponentType;
}): ComponentProps<object> => {
  const { block, exitNodeCb, removeBlock, setStateMemory } = props;

  // TODO: remove this function when backend stops sending f__exit_nodes in favor of propertyMeta
  const processExitNodes = ({
    properties,
    parentKey,
  }: {
    properties: Record<string, unknown>;
    parentKey?: string;
  }): Record<string, unknown> => {
    const _data = { ...properties };

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

    // Recursively process nested objects
    Object.entries(properties).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        _data[key] = value.map((item: Record<string, unknown>, index) => {
          if (typeof item === "object") {
            return processExitNodes({
              properties: item,
              parentKey: [parentKey, key, index].filter((x) => x !== undefined).join("."),
            });
          }

          return item;
        });
      }
    });

    return _data;
  };

  const dataWithExitNodes = processExitNodes({ properties: block.data });

  const processData = ({ value, parentKey }: { value: unknown; parentKey: string }): unknown => {
    if (typeof value === "string") {
      return template(value, props.userProperties);
    }

    if (Array.isArray(value)) {
      return value.map((item: unknown, index) => {
        if (item && typeof item === "object") {
          return mapValues(item as Record<string, unknown>, (v, key) => {
            const childParentKey = [parentKey, index, key].join(".");
            return processData({
              value: v,
              parentKey: childParentKey,
            });
          });
        }
        return item;
      });
    }

    return value;
  };

  const data = mapValues(dataWithExitNodes, (value, key) => {
    return processData({ value, parentKey: key });
  });

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
      const propValue = createActionBase({ propMeta, userProperties: props.userProperties });

      const exitNode = propMeta.value.exitNode;
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
      LinkComponent: props.LinkComponent,
    },
    ...data,
    ...methods,
  };
};

export const createTourComponentProps = ({
  tourSteps,
  tourStep,
  currentIndex,
  userProperties,
  handleCancel,
  handleContinue,
  handlePrevious,
  LinkComponent,
}: {
  tourSteps: TourStep[];
  tourStep: TourStep;
  currentIndex: number;
  userProperties: UserProperties;
  handleContinue: () => void;
  handlePrevious: () => void;
  handleCancel: () => void;
  LinkComponent?: LinkComponentType;
}): TourComponentProps<object> => {
  const isFirstStep = currentIndex === 0;

  const processData = (value: unknown): unknown => {
    if (typeof value === "string") {
      return template(value, userProperties);
    }
    if (Array.isArray(value)) {
      return value.map((item: unknown) => {
        if (item && typeof item === "object") {
          return mapValues(item, processData);
        }

        return item;
      });
    }

    return value;
  };

  const data = mapValues(tourStep.data, processData);

  for (const propMeta of tourStep.propertyMeta ?? []) {
    if (propMeta.type === "action") {
      const propValue = createActionBase({ propMeta, userProperties });

      if (propMeta.value.exitNode) {
        // eslint-disable-next-line @typescript-eslint/require-await -- needed for the callAction to return Promise
        propValue.callAction = async () => {
          if (propMeta.value.exitNode === "continue") handleContinue();
          if (propMeta.value.exitNode === "previous") handlePrevious();
          if (propMeta.value.exitNode === "cancel") handleCancel();
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
      LinkComponent,
    },
    ...data,
    continue: handleContinue,
    previous: !isFirstStep ? handlePrevious : undefined,
    cancel: handleCancel,
  };
};
