/* eslint-disable @typescript-eslint/no-explicit-any -- needed for our purposes */

export type Component<T extends Record<string, any> = any> = (props: T) => {
  element: HTMLElement;
  cleanup: () => void;
};

export type Components = Record<string, Component>;
