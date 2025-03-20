import { type Block } from "@flows/shared";
import { effect, signal } from "@preact/signals-core";
import { type FlowsOptions } from "./types/configuration";

type Configuration = Omit<FlowsOptions, "apiUrl"> & { apiUrl: string };
export const config = signal<Configuration>();

// We're not setting default to avoid accessing window on the server
export const pathname = signal<string>();

export const blocks = signal<Block[]>([]);

export type RemoveBlock = (blockId: string) => void;
export type UpdateBlock = (blockId: string, updateFn: (block: Block) => Block) => void;
export const removeBlock: RemoveBlock = (blockId) => {
  blocks.value = blocks.value.filter((b) => b.id !== blockId);
};
export const updateBlock: UpdateBlock = (blockId, updateFn) => {
  blocks.value = blocks.value.map((b) => (b.id === blockId ? updateFn(b) : b));
};

export interface RunningTour {
  blockId: string;
  currentBlockIndex: number;
}
export const runningTours = signal<RunningTour[]>([]);

effect(() => {
  const blocksValue = blocks.value;

  const tourBlocks = blocksValue.filter((b) => b.type === "tour");
  const prevTours = runningTours.peek();
  const prevTourMap = new Map(prevTours.map((tour) => [tour.blockId, tour]));
  const newRunningTours = tourBlocks.map((block): RunningTour => {
    const currentState = prevTourMap.get(block.id);
    const currentBlockIndex = currentState?.currentBlockIndex ?? block.currentTourIndex ?? 0;
    return {
      blockId: block.id,
      currentBlockIndex,
    };
  });
  runningTours.value = newRunningTours;
});
