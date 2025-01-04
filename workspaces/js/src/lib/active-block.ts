import { type Block, getApi } from "@flows/shared";
import { type ActiveBlock } from "../types/active-block";
import { config } from "../store";

export const blockToActiveBlock = (block: Block): ActiveBlock | [] => {
  if (!block.componentType) return [];
  const data = block.data;
  const methods = block.exitNodes.reduce<Record<string, () => Promise<void>>>((acc, exitNode) => {
    const transition = async (): Promise<void> => {
      const configuration = config.value;
      if (!configuration) return;
      const { environment, organizationId, userId, apiUrl } = configuration;
      await getApi(apiUrl).sendEvent({
        name: "transition",
        propertyKey: exitNode,
        blockId: block.id,
        environment,
        organizationId,
        userId,
      });
    };
    acc[exitNode] = transition;
    return acc;
  }, {});

  return {
    id: block.id,
    type: "component",
    component: block.componentType,
    props: { ...data, ...methods },
  };
};
