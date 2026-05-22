import { set } from "es-toolkit/compat";
import { mapValues } from "es-toolkit";
import { type ComponentProps, type Block, type StateMemory, type UserProperties } from "../types";
import { template } from "../template";
import type { ExitNodeCb, SetStateMemory } from "./component-props-types";
import { createActionBase } from "./component-props-shared";

export const createComponentProps = (props: {
  block: Block;
  removeBlock: (blockId: string) => void;
  exitNodeCb: ExitNodeCb;
  setStateMemory: SetStateMemory;
  userProperties: UserProperties;
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
    },
    ...data,
    ...methods,
  };
};
