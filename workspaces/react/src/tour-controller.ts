import { type FC, useEffect, useMemo } from "react";
import { useFlowsContext } from "./flows-context";
import { usePathname } from "./contexts/pathname-context";
import { elementContains, pathnameMatch } from "./lib/matchers";

export const TourController: FC = () => {
  const { runningTours } = useFlowsContext();
  const pathname = usePathname();

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

      relevantTours.forEach((tour) => {
        const tourWait = tour.activeStep?.tourWait;

        if (tourWait?.interaction === "click") {
          const pageMatch = pathnameMatch({
            pathname,
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

  return null;
};
