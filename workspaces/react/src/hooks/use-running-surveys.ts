import type { Block } from "@flows/shared";
import {
  getPathname,
  blockTriggerMatch,
  getSessionStorageRunningSurveys,
  saveSessionStorageRunningSurveys,
} from "@flows/shared";
import { usePathname } from "../contexts/pathname-context";
import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "es-toolkit";

type Props = {
  blocksState: Block[] | null;
};

export const useRunningSurveys = ({ blocksState: blocks }: Props): string[] => {
  const [runningSurveyBlockStateIds, setRunningSurveyBlockStateIds] = useState<string[]>(
    getSessionStorageRunningSurveys(),
  );

  // Save surveys to sessionStorage
  useEffect(() => {
    saveSessionStorageRunningSurveys(runningSurveyBlockStateIds);
  }, [runningSurveyBlockStateIds]);

  const runningSurveyBlockStateIdsRef = useRef(runningSurveyBlockStateIds);
  runningSurveyBlockStateIdsRef.current = runningSurveyBlockStateIds;

  const pathname = usePathname();

  // Remove surveys that are no longer running
  useEffect(() => {
    if (!blocks) return;

    const surveyBlockStateIds = new Set(
      blocks
        .filter((b) => b.type === "survey")
        .map((b) => b.survey?.blockStateId)
        .filter((id): id is string => !!id),
    );
    setRunningSurveyBlockStateIds((prev) => prev.filter((id) => surveyBlockStateIds.has(id)));
  }, [blocks]);

  const startSurveysIfNeeded = useCallback(
    (ctx: { pathname: string; event?: MouseEvent }) => {
      if (!blocks) return;

      const surveyBlocks = blocks.filter((b) => b.type === "survey");
      const runningSurveyBlockStateIdsSet = new Set(runningSurveyBlockStateIdsRef.current);

      surveyBlocks.forEach((block) => {
        const blockStateId = block.survey?.blockStateId;
        if (!blockStateId) return;
        if (runningSurveyBlockStateIdsSet.has(blockStateId)) return;
        const triggerMatch = blockTriggerMatch(block.tour_trigger, ctx);
        if (!triggerMatch) return;

        setRunningSurveyBlockStateIds((prev) => [...prev, blockStateId]);
      });
    },
    [blocks],
  );

  // Handle trigger by navigation
  useEffect(() => {
    if (!pathname) return;

    startSurveysIfNeeded({ pathname });
  }, [pathname, startSurveysIfNeeded]);

  // Handle trigger by DOM element
  useEffect(() => {
    const debouncedCallback = debounce(() => {
      startSurveysIfNeeded({ pathname: getPathname() });
    }, 32);

    const observer = new MutationObserver(debouncedCallback);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    // Run once to catch existing elements
    debouncedCallback();
    return () => {
      observer.disconnect();
    };
  }, [startSurveysIfNeeded]);

  // Handle trigger by click
  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      startSurveysIfNeeded({ pathname: getPathname(), event });
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [startSurveysIfNeeded]);

  return runningSurveyBlockStateIds;
};
