import {
  type addFloatingBlocksChangeListener,
  type addSlotBlocksChangeListener,
  type getCurrentFloatingBlocks,
  type getCurrentSlotBlocks,
} from "@flows/js";
import type { Components, SurveyComponents, TourComponents } from "./types";

export const components: Components = {};
export const tourComponents: TourComponents = {};
export const surveyComponents: SurveyComponents = {};

export const jsMethods: {
  addFloatingBlocksChangeListener?: typeof addFloatingBlocksChangeListener;
  getCurrentFloatingBlocks?: typeof getCurrentFloatingBlocks;
  addSlotBlocksChangeListener?: typeof addSlotBlocksChangeListener;
  getCurrentSlotBlocks?: typeof getCurrentSlotBlocks;
} = {};
