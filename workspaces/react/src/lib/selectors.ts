import { type Block, type TourStep } from "@flows/shared";

export const getSlot = (block?: Block | TourStep): string | undefined => block?.slotId;
