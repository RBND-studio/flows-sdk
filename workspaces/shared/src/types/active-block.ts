import { type FlowsProperties } from "./components";

export interface ActiveBlock {
  /**
   * Unique identifier of the block, useful for stable key during rendering. Keep in mind each workflow version will have a different id for each block.
   */
  id: string;
  /**
   * Unique identifier of the tour block this tour-component belongs to. Keep in mind each workflow version will have a different id for each block.
   */
  tourBlockId?: string;
  /**
   * Type of the block, either "component" or "tour-component".
   */
  type: "component" | "tour-component";
  /**
   * The UI Component used to render this block.
   */
  component: string;
  /**
   * Props to be passed to the component including both data and exit node methods.
   */
  props: { __flows: FlowsProperties } & Record<string, unknown>;
}

export const createActiveBlockProxy = (
  block: ActiveBlock,
  sendActivate: (blockId: string) => Promise<void>,
): ActiveBlock => {
  return new Proxy<ActiveBlock>(block, {
    get(target, prop, receiver) {
      if (prop === "props") void sendActivate(block.id);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- it's needed for the proxy to work
      return Reflect.get(target, prop, receiver);
    },
  });
};
