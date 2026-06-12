import {
  type Block,
  logSlottableBlocksError,
  type BlockUpdatesMessage,
  getSessionStorageRunningSurveys,
  updateClosedBlockStateIds,
  getClosedBlockStateIds,
} from "@flows/shared";
import { computed, effect, signal } from "@preact/signals-core";
import { type FlowsOptions } from "./types/configuration";

type Configuration = Omit<FlowsOptions, "apiUrl"> & { apiUrl: string };
export const config = signal<Configuration>();

// We're not setting default to avoid accessing window on the server
export const pathname = signal<string>();

// The blocks value is null until the SDK is initialized
const blocksState = signal<Block[] | null>(null);
export const updateBlocks = (value: Block[] | null): void => {
  blocksState.value = value;
};

const closedBlockStateIds = signal<string[] | null>(null);
const addClosedBlockStateId = (blockStateId: string): void => {
  closedBlockStateIds.value = [...(closedBlockStateIds.peek() ?? []), blockStateId];
  updateClosedBlockStateIds(closedBlockStateIds.peek() ?? []);
};
// Initialize closedBlockStateIds in browser from localStorage value
effect(() => {
  if (typeof window === "undefined") return;
  if (closedBlockStateIds.peek()) return;
  closedBlockStateIds.value = getClosedBlockStateIds();
});

export const blocks = computed(() => {
  const blocksStateValue = blocksState.value;
  const closedBlockStateIdsSet = new Set(closedBlockStateIds.value);

  if (!blocksStateValue) return blocksStateValue;
  return blocksStateValue.filter((b) => {
    if (!b.blockStateId) return true;
    return !closedBlockStateIdsSet.has(b.blockStateId);
  });
});
export const pendingMessages = signal<BlockUpdatesMessage[]>([]);

// Log error about slottable blocks without slotId
effect(() => {
  const blocksValue = blocks.value ?? [];
  logSlottableBlocksError(blocksValue);
});

export const blocksError = signal(false);
export const wsError = signal(false);

export type RemoveBlock = (blockId: string) => void;
export type UpdateBlock = (blockId: string, updateFn: (block: Block) => Block) => void;
export const removeBlock: RemoveBlock = (blockId) => {
  const blocksValue = blocks.value;
  if (!blocksValue) return;
  let removedBlockStateId: string | undefined = undefined;
  blocksState.value = blocksValue.filter((b) => {
    const shouldBeRemoved = b.id === blockId;
    if (shouldBeRemoved) removedBlockStateId = b.blockStateId;
    return !shouldBeRemoved;
  });
  if (removedBlockStateId) addClosedBlockStateId(removedBlockStateId);
};
export const updateBlock: UpdateBlock = (blockId, updateFn) => {
  const blocksValue = blocks.value;
  if (!blocksValue) return;
  blocksState.value = blocksValue.map((b) => (b.id === blockId ? updateFn(b) : b));
};

export interface RunningTour {
  blockId: string;
  currentBlockIndex: number;
}
export const tourBlocks = computed(() => (blocks.value ?? []).filter((b) => b.type === "tour"));
export const runningTours = signal<RunningTour[]>([]);

export const runningSurveyBlockStateIds = signal<string[]>(getSessionStorageRunningSurveys());
