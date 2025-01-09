import { type Block } from "@flows/shared";
import { effect, signal } from "@preact/signals-core";
import { type FlowsOptions } from "./types/configuration";

type Configuration = Omit<FlowsOptions, "apiUrl"> & { apiUrl: string };
export const config = signal<Configuration>();

// We're not setting default to avoid accessing window on the server
export const pathname = signal<string>();

export const blocks = signal<Block[]>([]);

export interface RunningTour {
  blockId: string;
  currentBlockIndex: number;
  hidden: boolean;
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
    const hidden = currentState?.hidden ?? false;
    return {
      blockId: block.id,
      currentBlockIndex,
      hidden,
    };
  });
  runningTours.value = newRunningTours;
});
