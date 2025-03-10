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
  runningTours: RunningTour[];
  removeBlock: (blockId: string) => void;
}

// eslint-disable-next-line -- necessary for noop
const noop = () => {};

export const FlowsContext = createContext<IFlowsContext>({
  blocks: [],
  components: {},
  tourComponents: {},
  runningTours: [],
  removeBlock: noop,
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
export const useFlowsContext = () => useContext(FlowsContext);
