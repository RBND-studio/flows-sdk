import { log } from "./log";

const CLOSED_BLOCKS_STORAGE_KEY = "flows-closed-blocks";

export const getClosedBlockStateIds = (): string[] => {
  try {
    const data = sessionStorage.getItem(CLOSED_BLOCKS_STORAGE_KEY);
    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    log.error("Error getting from localStorage");
  }
  return [];
};

export const updateClosedBlockStateIds = (blockStateIds: string[]): void => {
  try {
    sessionStorage.setItem(CLOSED_BLOCKS_STORAGE_KEY, JSON.stringify(blockStateIds));
  } catch {
    log.error("Error saving to localStorage");
  }
};
