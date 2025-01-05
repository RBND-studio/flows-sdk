import { type FC } from "react";
import { log, pathnameMatch } from "@flows/shared";
import { type RunningTour, useFlowsContext } from "./flows-context";
import { usePathname } from "./contexts/pathname-context";

interface Props {
  tour: RunningTour;
}

export const TourBlock: FC<Props> = ({ tour }) => {
  const {
    activeStep,
    currentBlockIndex,
    hidden,
    continue: handleContinue,
    previous: handlePrevious,
    cancel: handleCancel,
  } = tour;

  const { tourComponents } = useFlowsContext();
  const pathname = usePathname();

  if (!activeStep || hidden || !activeStep.componentType) return null;

  const Component = tourComponents[activeStep.componentType];
  if (!Component) {
    log.error(`Tour Component not found for tour block "${activeStep.componentType}"`);
    return null;
  }

  if (
    !pathnameMatch({
      pathname,
      operator: activeStep.page_targeting_operator,
      value: activeStep.page_targeting_values,
    })
  )
    return null;

  const isFirstStep = currentBlockIndex === 0;

  return (
    <Component
      {...activeStep.data}
      continue={handleContinue}
      previous={!isFirstStep ? handlePrevious : undefined}
      cancel={handleCancel}
    />
  );
};
