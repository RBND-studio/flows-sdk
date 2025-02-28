import { type FlowsProperties } from "./components";

type Props = {
  __flows: FlowsProperties;
} & Record<string, unknown>;

export interface ActiveBlock {
  /**
   * Unique identifier of the block, useful for stable key during rendering. Keep in mind each workflow version will have a different id for each block.
   */
  id: string;
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
  props: Props;
}
