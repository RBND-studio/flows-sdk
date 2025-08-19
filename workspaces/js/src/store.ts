import { type BlockUpdatesPayload, type Block } from "@flows/shared";
import { computed, signal } from "@preact/signals-core";
import { type FlowsOptions } from "./types/configuration";

type Configuration = Omit<FlowsOptions, "apiUrl"> & { apiUrl: string };
export const config = signal<Configuration>();

// We're not setting default to avoid accessing window on the server
export const pathname = signal<string>();

// The blocks value is null until the SDK is initialized
export const blocksState = signal<Block[] | null>(null);
export const blocks = computed(() => blocksState.value ?? []);
export const pendingMessages = signal<BlockUpdatesPayload[]>([]);

export const blocksError = signal(false);
export const wsError = signal(false);

export type RemoveBlock = (blockId: string) => void;
export type UpdateBlock = (blockId: string, updateFn: (block: Block) => Block) => void;
export const removeBlock: RemoveBlock = (blockId) => {
  blocksState.value = blocks.value.filter((b) => b.id !== blockId);
};
export const updateBlock: UpdateBlock = (blockId, updateFn) => {
  blocksState.value = blocks.value.map((b) => (b.id === blockId ? updateFn(b) : b));
};

export interface RunningTour {
  blockId: string;
  currentBlockIndex: number;
}
export const tourBlocks = computed(() => blocks.value.filter((b) => b.type === "tour"));
export const runningTours = signal<RunningTour[]>([]);
