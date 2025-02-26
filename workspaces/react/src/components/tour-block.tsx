import { type FC } from "react";
import { type ActiveBlock, log, pathnameMatch } from "@flows/shared";
import { type RunningTour, useFlowsContext } from "../flows-context";
import { usePathname } from "../contexts/pathname-context";

interface Props {
  // tour: RunningTour;
  block: ActiveBlock;
}

export const TourBlock: FC<Props> = ({ block }) => {
  // const {
  //   activeStep,
  //   currentBlockIndex,
  //   hidden,
  //   continue: handleContinue,
  //   previous: handlePrevious,
  //   cancel: handleCancel,
  // } = tour;

  const { tourComponents } = useFlowsContext();

  // if (!activeStep || hidden || !activeStep.componentType) return null;

  const Component = tourComponents[block.component];
  if (!Component) {
    log.error(`Tour Component not found for tour block "${block.component}"`);
    return null;
  }

  // const isFirstStep = currentBlockIndex === 0;

  return (
    <Component
      {...block.props}
      // {...activeStep.data}
      // continue={handleContinue}
      // previous={!isFirstStep ? handlePrevious : undefined}
      // cancel={handleCancel}
    />
  );
};
