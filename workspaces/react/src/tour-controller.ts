import { type FC, useEffect, useMemo } from "react";
import { elementContains, getPathname, pathnameMatch } from "@flows/shared";
import { useState } from "react";
import { useFlowsContext } from "./flows-context";
import { usePathname } from "./contexts/pathname-context";

export const TourController: FC = () => {
  const { runningTours } = useFlowsContext();
  const pathname = usePathname();
  // eslint-disable-next-line react/hook-use-state -- we need only the value
  const [timeoutByTourId] = useState(new Map<string, { timeoutId: number; stepId: string }>());

  // Filter out tours that are not waiting for navigation or interaction
  const relevantTours = useMemo(
    () => runningTours.filter((tour) => Boolean(tour.activeStep?.tourWait)),
    [runningTours],
  );

  // Handle navigation waits
  useEffect(() => {
    relevantTours.forEach((tour) => {
      const tourWait = tour.activeStep?.tourWait;
      if (tourWait?.interaction === "navigation") {
        const match = pathnameMatch({
          pathname,
          operator: tourWait.page?.operator,
          value: tourWait.page?.value,
        });

        if (match) tour.continue();
      }
    });
  }, [pathname, relevantTours]);

  // Handle interaction waits
  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      const eventTarget = event.target;
      if (!eventTarget || !(eventTarget instanceof Element)) return;

      const currentPathname = getPathname();

      relevantTours.forEach((tour) => {
        const tourWait = tour.activeStep?.tourWait;

        if (tourWait?.interaction === "click") {
          const pageMatch = pathnameMatch({
            pathname: currentPathname,
            operator: tourWait.page?.operator,
            value: tourWait.page?.value,
          });

          const clickMatch = elementContains({ eventTarget, value: tourWait.element });

          if (clickMatch && pageMatch) tour.continue();
        }
      });
    };

    addEventListener("click", handleClick);
    return () => {
      removeEventListener("click", handleClick);
    };
  }, [pathname, relevantTours]);

  // Handle delay waits
  useEffect(() => {
    relevantTours.forEach((tour) => {
      const activeStep = tour.activeStep;
      const tourWait = activeStep?.tourWait;
      const existingTimeout = timeoutByTourId.get(tour.block.id);

      if (existingTimeout && existingTimeout.stepId !== activeStep?.id) {
        clearTimeout(existingTimeout.timeoutId);
        timeoutByTourId.delete(tour.block.id);
      }

      if (
        activeStep &&
        tourWait?.interaction === "delay" &&
        tourWait.ms !== undefined &&
        !timeoutByTourId.has(tour.block.id)
      ) {
        const timeoutId = window.setTimeout(() => {
          tour.continue();
          timeoutByTourId.delete(tour.block.id);
        }, tourWait.ms);
        timeoutByTourId.set(tour.block.id, { timeoutId, stepId: activeStep.id });
      }
    });
  }, [relevantTours, timeoutByTourId]);

  return null;
};
