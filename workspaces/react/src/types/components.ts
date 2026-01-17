import { type ComponentProps, type TourComponentProps } from "@flows/shared";
import { type ReactNode, type FC } from "react";

export type Component = FC<ComponentProps>;
export type Components = Record<string, Component>;

export type TourComponent = FC<TourComponentProps>;
export type TourComponents = Record<string, TourComponent>;

export interface LinkComponentProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}
