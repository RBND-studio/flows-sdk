/* eslint-disable @typescript-eslint/no-explicit-any -- needed for loose types */

import { type TourComponentProps } from "@flows/shared";

export type Component<T extends Record<string, any> = any> = (props: T) => {
  element: HTMLElement | null;
  cleanup: () => void;
};
export type TourComponent<T extends Record<string, any> = any> = Component<TourComponentProps<T>>;

export type Components = Record<string, Component>;
export type TourComponents = Record<string, TourComponent>;
