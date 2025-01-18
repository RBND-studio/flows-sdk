/* eslint-disable @typescript-eslint/no-explicit-any -- needed for loose types */

export type TourComponentProps<T extends Record<string, any> = any> = {
  continue: () => void;
  previous?: () => void;
  cancel: () => void;
} & T;
