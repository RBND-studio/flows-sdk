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
  const [runningSurveyIds, setRunningSurveyIds] = useState<string[]>(
    getSessionStorageRunningSurveys(),
  );
  useEffect(() => {
    saveSessionStorageRunningSurveys(runningSurveyIds);
  }, [runningSurveyIds]);

  const runningSurveyIdsRef = useRef(runningSurveyIds);
  runningSurveyIdsRef.current = runningSurveyIds;

  const pathname = usePathname();

  // Remove surveys that are no longer running
  useEffect(() => {
    if (!blocks) return;

    const surveyBlockIds = new Set(blocks.filter((b) => b.type === "survey").map((b) => b.id));
    setRunningSurveyIds((prev) => prev.filter((id) => surveyBlockIds.has(id)));
  }, [blocks]);

  const startSurveysIfNeeded = useCallback(
    (ctx: { pathname: string; event?: MouseEvent }) => {
      if (!blocks) return;

      const surveyBlocks = blocks.filter((b) => b.type === "survey");
      const runningSurveyIdsSet = new Set(runningSurveyIdsRef.current);

      surveyBlocks.forEach((block) => {
        if (runningSurveyIdsSet.has(block.id)) return;
        const triggerMatch = blockTriggerMatch(block.tour_trigger, ctx);
        if (!triggerMatch) return;

        setRunningSurveyIds((prev) => [...prev, block.id]);
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

  return runningSurveyIds;
};
