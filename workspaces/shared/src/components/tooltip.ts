import type { TooltipScrollPosition } from "../types";

export const tooltipScrollPositionToScrollLogicalPosition = (
  scrollPosition?: TooltipScrollPosition,
): ScrollLogicalPosition | undefined => {
  if (scrollPosition === "top") return "start";
  if (scrollPosition === "bottom") return "end";
  if (scrollPosition === "center") return "center";
  if (scrollPosition === "nearest") return "nearest";
};

export const tooltipScrollToTarget = ({
  blockScrollPosition,
  reference,
  onTargetInView,
}: {
  reference: Element;
  blockScrollPosition: ScrollLogicalPosition;
  onTargetInView: () => void;
}): (() => void) => {
  const scrollTargetClassName = "flows_basicsV2_tooltip_scroll_target";
  reference.classList.add(scrollTargetClassName);
  reference.scrollIntoView({
    behavior: "smooth",
    block: blockScrollPosition,
  });

  const cleanup = () => {
    observer.disconnect();
    reference.classList.remove(scrollTargetClassName);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries.at(0);
      if (entry?.isIntersecting) {
        onTargetInView();
        cleanup();
      }
    },
    { threshold: 0 },
  );
  observer.observe(reference);

  return cleanup;
};
