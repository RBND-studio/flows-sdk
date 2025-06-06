import { set } from "es-toolkit/compat";
import { type ComponentProps, type Block, type StateMemory } from "./types";

export type SetStateMemory = (key: string, value: boolean) => Promise<void>;

export const createComponentProps = ({
  block,
  exitNodeCb,
  removeBlock,
  setStateMemory,
}: {
  block: Block;
  removeBlock: (blockId: string) => void;
  exitNodeCb: (key: string) => Promise<void>;
  setStateMemory: (key: string, value: boolean) => Promise<void>;
}): ComponentProps<object> => {
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
      const cb = (): Promise<void> =>
        exitNodeCb([parentKey, exitNode].filter((x) => x !== undefined).join("."));
      _data[exitNode] = cb;
    });

    return _data;
  };

  const data = processData({ properties: block.data });

  for (const propMeta of block.propertyMeta ?? []) {
    if (propMeta.type === "state-memory") {
      const stateMemoryValue: StateMemory = {
        value: propMeta.value ?? false,
        setValue: (value: boolean) => {
          void setStateMemory(propMeta.key, value);
        },
        triggers: propMeta.triggers ?? [],
      };
      set(data, propMeta.key, stateMemoryValue);
    }
  }

  const methods = block.exitNodes.reduce<Record<string, () => Promise<void>>>((acc, exitNode) => {
    const cb = (): Promise<void> => {
      removeBlock(block.id);
      return exitNodeCb(exitNode);
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
