/* eslint-disable @typescript-eslint/no-explicit-any -- needed for loose types */

import { type ComponentProps, type TourComponentProps } from "@flows/shared";

export type _Component<T extends Record<string, any> = any> = (props: T) => {
  element: HTMLElement | null;
  cleanup: () => void;
};
export type Component<T extends Record<string, any> = any> = _Component<ComponentProps<T>>;
export type TourComponent<T extends Record<string, any> = any> = _Component<TourComponentProps<T>>;

export type Components = Record<string, Component>;
export type TourComponents = Record<string, TourComponent>;
