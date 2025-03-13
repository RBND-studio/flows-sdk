import { type FlowsProperties } from "./components";

export interface ActiveBlock {
  /**
   * Unique identifier of the block, useful for stable key during rendering. Keep in mind each workflow version will have a different id for each block.
   */
  id: string;
  /**
   * Id of the workflow this block belongs to.
   */
  workflowId: string;
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
