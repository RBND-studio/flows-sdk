import {
  type addFloatingBlocksChangeListener,
  type addSlotBlocksChangeListener,
  type getCurrentFloatingBlocks,
  type getCurrentSlotBlocks,
} from "@flows/js";
import { type Components, type TourComponents } from "./types";

export const components: Components = {};
export const tourComponents: TourComponents = {};

export const jsMethods: {
  addFloatingBlocksChangeListener?: typeof addFloatingBlocksChangeListener;
  getCurrentFloatingBlocks?: typeof getCurrentFloatingBlocks;
  addSlotBlocksChangeListener?: typeof addSlotBlocksChangeListener;
  getCurrentSlotBlocks?: typeof getCurrentSlotBlocks;
} = {};
