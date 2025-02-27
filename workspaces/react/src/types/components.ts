import { type ComponentProps, type TourComponentProps } from "@flows/shared";
import { type FC } from "react";

export type Component = FC<ComponentProps>;
export type Components = Record<string, Component>;

export type TourComponent = FC<TourComponentProps>;
export type TourComponents = Record<string, TourComponent>;
