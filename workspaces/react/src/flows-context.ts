import { createContext, useContext } from "react";
import { type Block, type TourStep } from "@flows/shared";
import { type Components, type TourComponents } from "./types";

export interface RunningTour {
  block: Block;
  currentBlockIndex: number;
  activeStep?: TourStep;
  previous: () => void;
  continue: () => void;
  cancel: () => void;
}

export type RemoveBlock = (blockId: string) => void;
export type UpdateBlock = (blockId: string, updateFn: (block: Block) => Block) => void;

export interface IFlowsContext {
  blocks: Block[];
  components: Components;
  tourComponents: TourComponents;
  runningTours: RunningTour[];
  removeBlock: RemoveBlock;
  updateBlock: UpdateBlock;
}

// eslint-disable-next-line -- necessary for noop
const noop = () => {};

export const FlowsContext = createContext<IFlowsContext>({
  blocks: [],
  components: {},
  tourComponents: {},
  runningTours: [],
  removeBlock: noop,
  updateBlock: noop,
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
export const useFlowsContext = () => useContext(FlowsContext);
