import { createContext, type FC, useContext } from "react";
import { type Block, type TourStep, type UserProperties } from "@flows/shared";
import { type LinkComponentProps, type Components, type TourComponents } from "./types";

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
  userProperties: UserProperties;
  components: Components;
  tourComponents: TourComponents;
  runningTours: RunningTour[];
  removeBlock: RemoveBlock;
  updateBlock: UpdateBlock;
  LinkComponent?: FC<LinkComponentProps>;
}

// eslint-disable-next-line -- necessary for noop
const noop = () => {};

export const FlowsContext = createContext<IFlowsContext>({
  blocks: [],
  components: {},
  tourComponents: {},
  runningTours: [],
  userProperties: {},
  removeBlock: noop,
  updateBlock: noop,
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
export const useFlowsContext = () => useContext(FlowsContext);
