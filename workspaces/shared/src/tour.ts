import type { Block } from "./types";

export const hasActiveTourSession = (props: {
  block: Block;
  currentTourIndex: number;
}): boolean => {
  const { block, currentTourIndex } = props;
  return !!block.tourSessionEndAction && currentTourIndex > 0;
};
