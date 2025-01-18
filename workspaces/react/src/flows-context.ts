import { createContext, useContext } from "react";
import { type Block, type TourStep } from "@flows/shared";
import { type Components, type TourComponents } from "./types";

export interface RunningTour {
  block: Block;
  currentBlockIndex: number;
  activeStep?: TourStep;
  hidden: boolean;
  hide: () => void;
  previous: () => void;
  continue: () => void;
  cancel: () => void;
}

export interface IFlowsContext {
  blocks: Block[];
  components: Components;
  tourComponents: TourComponents;
  sendEvent: (props: {
    name: "transition" | "tour-update";
    exitNode?: string;
    blockId: string;
    properties?: Record<string, unknown>;
  }) => Promise<void>;
  runningTours: RunningTour[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-function -- ignore
const asyncNoop = async (): Promise<void> => {};
export const FlowsContext = createContext<IFlowsContext>({
  blocks: [],
  components: {},
  tourComponents: {},
  sendEvent: asyncNoop,
  runningTours: [],
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
export const useFlowsContext = () => useContext(FlowsContext);
