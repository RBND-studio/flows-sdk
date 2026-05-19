import { effect } from "@preact/signals-core";
import { blocks, blocksState, pathname, runningSurveyBlockStateIds } from "./store";
import type { Block } from "@flows/shared";
import { blockTriggerMatch, getPathname, saveSessionStorageRunningSurveys } from "@flows/shared";
import { debounce } from "es-toolkit";

// Save surveys to sessionStorage
effect(() => {
  saveSessionStorageRunningSurveys(runningSurveyBlockStateIds.value);
});

const startSurveysIfNeeded = (
  blocks: Block[],
  ctx: { pathname: string; event?: MouseEvent },
): void => {
  const surveyBlocks = blocks.filter((b) => b.type === "survey");
  const runningSurveyBlockStateIdsSet = new Set(runningSurveyBlockStateIds.peek());

  surveyBlocks.forEach((block) => {
    const blockStateId = block.survey?.blockStateId;
    if (!blockStateId) return;
    if (runningSurveyBlockStateIdsSet.has(blockStateId)) return;
    const triggerMatch = blockTriggerMatch(block.tour_trigger, ctx);
    if (!triggerMatch) return;

    runningSurveyBlockStateIds.value = [...runningSurveyBlockStateIds.peek(), blockStateId];
  });
};

// Remove surveys that are no longer running
effect(() => {
  const blocks = blocksState.value;
  if (!blocks) return;

  const surveyBlockStateIds = new Set(
    blocks
      .filter((b) => b.type === "survey")
      .map((b) => b.survey?.blockStateId)
      .filter((id): id is string => !!id),
  );
  runningSurveyBlockStateIds.value = runningSurveyBlockStateIds
    .peek()
    .filter((id) => surveyBlockStateIds.has(id));
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
