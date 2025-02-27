/* eslint-disable @typescript-eslint/no-explicit-any -- needed for loose types */

export interface FlowsProperties {
  key?: string;
}

export type ComponentProps<T extends Record<string, any> = any> = {
  __flows: FlowsProperties;
} & T;

export type TourComponentProps<T extends Record<string, any> = any> = {
  __flows: FlowsProperties;
  continue: () => void;
  previous?: () => void;
  cancel: () => void;
} & T;
