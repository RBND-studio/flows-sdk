/* eslint-disable @typescript-eslint/no-explicit-any -- needed for our purposes */

import { type TourComponentProps } from "@flows/shared";
import { type FC } from "react";

type FlowsComponentProps<T extends Record<string, any> = any> = T;
export type Components = Record<string, FC<FlowsComponentProps>>;

export type TourComponent = FC<TourComponentProps>;
export type TourComponents = Record<string, TourComponent>;
