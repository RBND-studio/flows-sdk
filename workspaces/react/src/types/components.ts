import { type TourComponentProps } from "@flows/shared";
import { type FC } from "react";

type FlowsComponentProps<T = object> = T;
export type Components = Record<string, FC<FlowsComponentProps>>;

export type TourComponent = FC<TourComponentProps>;
export type TourComponents = Record<string, TourComponent>;
