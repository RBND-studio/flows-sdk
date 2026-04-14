import { effect } from "@preact/signals-core";
import { blocks, blocksState, pathname, runningSurveyIds } from "./store";
import type { Block } from "@flows/shared";
import { blockTriggerMatch, getPathname } from "@flows/shared";
import { debounce } from "es-toolkit";

const startSurveysIfNeeded = (
  blocks: Block[],
  ctx: { pathname: string; event?: MouseEvent },
): void => {
  const surveyBlocks = blocks.filter((b) => b.type === "survey");
  const runningSurveyIdsSet = new Set(runningSurveyIds.peek());

  surveyBlocks.forEach((block) => {
    if (runningSurveyIdsSet.has(block.id)) return;
    const triggerMatch = blockTriggerMatch(block.tour_trigger, ctx);
    if (!triggerMatch) return;

    runningSurveyIds.value = [...runningSurveyIds.peek(), block.id];
  });
};

// Remove surveys that are no longer running
effect(() => {
  const blocks = blocksState.value;
  if (!blocks) return;

  const surveyBlockIds = new Set(blocks.filter((b) => b.type === "survey").map((b) => b.id));
  runningSurveyIds.value = runningSurveyIds.peek().filter((id) => surveyBlockIds.has(id));
});

// Handle trigger by navigation
effect(() => {
  const blocksValue = blocks.value;
  const pathnameValue = pathname.value;

  if (!pathnameValue) return;

  startSurveysIfNeeded(blocksValue, { pathname: pathnameValue });
});

// Handle trigger by DOM element
effect(() => {
  // Ensure this effect runs only in the browser environment because of the MutationObserver
  if (typeof window === "undefined") return;

  const blocksValue = blocks.value;

  const debouncedCallback = debounce(() => {
    startSurveysIfNeeded(blocksValue, { pathname: getPathname() });
  }, 32);

  const observer = new MutationObserver(debouncedCallback);
  observer.observe(document, { childList: true, subtree: true, attributes: true });
  // Run once to catch existing elements
  debouncedCallback();
  return () => {
    observer.disconnect();
  };
});

// Handle trigger by click
export const handleSurveyDocumentClick = (event: MouseEvent): void => {
  startSurveysIfNeeded(blocks.value, { pathname: getPathname(), event });
};
