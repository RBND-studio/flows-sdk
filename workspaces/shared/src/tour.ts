import { log } from "./log";
import type { Block, TourStep } from "./types";
import { sum } from "es-toolkit";

export type IRunningTour = {
  blockId: string;
  currentBlockIndex: number;
};

export type TourSessionData = {
  onlyRunningTourBlockId?: string;
  runningTours: IRunningTour[];
};

const SESSION_STORAGE_KEY = "flows-running-tours";

export const getRunningToursFromSessionStorage = (): TourSessionData => {
  try {
    const item = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!item) throw new Error();

    const parsedValue = JSON.parse(item);

    return {
      onlyRunningTourBlockId: parsedValue.onlyRunningTourBlockId,
      runningTours: parsedValue.runningTours.map((tour: IRunningTour) => ({
        blockId: String(tour.blockId),
        currentBlockIndex: Number(tour.currentBlockIndex),
      })),
    };
  } catch {
    return { runningTours: [] };
  }
};

export const setRunningToursToSessionStorage = (value: TourSessionData): void => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(value));
  } catch {
    log.error("Failed to write to sessionStorage");
  }
};

export const sortToursByPriority = (tours: Block[]): Block[] => {
  return [...tours].sort((a, b) => getTourPriority(b) - getTourPriority(a));
};

const getTourPriority = (block: Block): number => {
  const tourTriggerValue = sum(
    block.tour_trigger?.$and?.map((expr) => {
      if (expr.type === "click") return 10;
      return 1;
    }) ?? [],
  );

  return tourTriggerValue;
};

export const getHighestPriorityRunningTour = (
  tours: { block: Block; activeStep?: TourStep }[],
): Block | undefined => {
  const runningToursWithComponentActiveStep = tours.filter((tour) =>
    Boolean(tour.activeStep?.type === "tour-component"),
  );
  const sortedTours = sortToursByPriority(
    runningToursWithComponentActiveStep.map((tour) => tour.block),
  );

  const highestPriorityTour = sortedTours.at(0);
  return highestPriorityTour;
};

export const shouldTourOverrideOnlyRunning = (block: Block): boolean => {
  const hasClickTrigger = block.tour_trigger?.$and?.some((expr) => expr.type === "click");
  return !!hasClickTrigger;
};
