import type { TooltipScrollPosition } from "../types";

export const tooltipScrollPositionToScrollLogicalPosition = (
  scrollPosition?: TooltipScrollPosition,
): ScrollLogicalPosition | undefined => {
  if (scrollPosition === "top") return "start";
  if (scrollPosition === "bottom") return "end";
  if (scrollPosition === "center") return "center";
  if (scrollPosition === "nearest") return "nearest";
};
