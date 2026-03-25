import type { Block } from "@flows/shared";
import { getPathname, blockTriggerMatch } from "@flows/shared";
import { usePathname } from "../contexts/pathname-context";
import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "es-toolkit";

type Props = {
  blocks: Block[];
};

const SESSION_STORAGE_KEY = "flows-running-surveys";

const getSessionStorageValue = (): string[] => {
  if (typeof window === "undefined") return [];

  const item = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!item) return [];

  try {
    const parsedValue = JSON.parse(item);
    if (!Array.isArray(parsedValue) || !parsedValue.every((v) => typeof v === "string")) {
      throw new Error();
    }

    return parsedValue;
  } catch {
    return [];
  }
};

export const useRunningSurveys = ({ blocks }: Props): string[] => {
  const [runningSurveyIds, setRunningSurveyIds] = useState<string[]>(getSessionStorageValue());
  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(runningSurveyIds));
  }, [runningSurveyIds]);

  const runningSurveyIdsRef = useRef(runningSurveyIds);
  runningSurveyIdsRef.current = runningSurveyIds;

  const pathname = usePathname();

  const startSurveysIfNeeded = useCallback(
    (ctx: { pathname: string; event?: MouseEvent }) => {
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
