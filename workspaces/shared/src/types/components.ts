/* eslint-disable @typescript-eslint/no-explicit-any -- needed for loose types */

/**
 * Properties provided by Flows based on block and block template setup.
 */
export interface FlowsProperties {
  /**
   * Unique identifier of the block, useful for stable key during rendering. Keep in mind each workflow version will have a different id for each block.
   */
  id: string;
  /**
   * User defined key for identifying the block.
   */
  key?: string;
  /**
   * Id of the workflow this block belongs to.
   */
  workflowId: string;
  /**
   * Total number of visible tour blocks (components) in the current tour.
   */
  tourVisibleStepCount?: number;
  /**
   * 0-based index of the currently visible tour block (component) in the current tour.
   */
  tourVisibleStepIndex?: number;
}

export type ComponentProps<T extends Record<string, any> = any> = {
  /**
   * Properties provided by Flows based on block and block template setup.
   */
  __flows: FlowsProperties;
} & T;

export type TourComponentProps<T extends Record<string, any> = any> = {
  /**
   * Properties provided by Flows based on block and block template setup.
   */
  __flows: FlowsProperties;

  continue: () => void;
  previous?: () => void;
  cancel: () => void;
} & T;

export type StateMemoryTriggerType = "transition" | "manual";

export interface StateMemoryTrigger {
  /**
   * Type of the trigger.
   */
  type: StateMemoryTriggerType;
  /**
   * Id of the block that will set the state memory to true when it is exited.
   */
  blockId?: string;
  /**
   * User defined key for identifying the tracked block.
   */
  blockKey?: string;
}

/**
 * The object representing state memory property in your component properties.
 */
export interface StateMemory {
  /**
   * Boolean value of the state memory property.
   */
  value: boolean;
  /**
   * Update the state memory property.
   * @param value - new boolean value to set
   */
  setValue: (value: boolean) => void;
  /**
   * Triggers you have setup in the workflow for this state memory property.
   */
  triggers: StateMemoryTrigger[];
}
/**
 * The object representing action property in your component properties.
 */
export interface Action {
  /**
   * The label of the element used to trigger the action (eg. button text).
   */
  label: string;
  /**
   * Optional URL to navigate to when the action is triggered.
   * When provided no special handling is done, you need to handle the navigation yourself using a link or similar.
   */
  url?: string;
  /**
   * Optional flag to open the URL in a new tab.
   * When provided no special handling is done, you need to pass this to the element that will handle the navigation.
   */
  openInNew?: boolean;
  /**
   * Function to call when the action is triggered.
   * Currently supports only transition to a specified exit node.
   */
  callAction?: () => Promise<void>;
}

/**
 * The object representing block state of the selected block in the workflow.
 * The properties of this object are the same as the properties of the block.
 */
export type BlockState<T extends Record<string, any> = any> = ComponentProps<T>;
