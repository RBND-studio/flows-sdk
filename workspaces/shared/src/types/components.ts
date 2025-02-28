/* eslint-disable @typescript-eslint/no-explicit-any -- needed for loose types */

/**
 * Properties provided by Flows based on block and block template setup.
 */
export interface FlowsProperties {
  /**
   * User defined key for identifying the block.
   */
  key?: string;
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
