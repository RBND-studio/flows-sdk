import { useMemo, type FC } from "react";
import { log, pathnameMatch } from "@flows/shared";
import { type Block as IBlock } from "@flows/shared";
import { useFlowsContext } from "./flows-context";
import { usePathname } from "./contexts/pathname-context";

interface Props {
  block: IBlock;
}

export const Block: FC<Props> = ({ block }) => {
  const { components, sendEvent } = useFlowsContext();
  const pathname = usePathname();

  const methods = useMemo(
    () =>
      block.exitNodes.reduce(
        (acc, exitNode) => ({
          ...acc,
          [exitNode]: () => sendEvent({ name: "transition", exitNode, blockId: block.id }),
        }),
        {},
      ),
    [block.exitNodes, block.id, sendEvent],
  );

  const data = useMemo(() => {
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
            exitNode: [parentKey, exitNode].filter((x) => x !== undefined).join("."),
            blockId: block.id,
          });
      });

      return _data;
    };

    return processData({ properties: block.data });
  }, [block.data, block.id, sendEvent]);

  if (!block.componentType) return null;

  const Component = components[block.componentType];
  if (!Component) {
    log.error(`Component not found for workflow block "${block.componentType}"`);
    return null;
  }

  if (
    !pathnameMatch({
      pathname,
      operator: block.page_targeting_operator,
      value: block.page_targeting_values,
    })
  )
    return null;

  return <Component key={block.id} {...data} {...methods} />;
};
