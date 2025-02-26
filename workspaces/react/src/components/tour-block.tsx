import { type FC } from "react";
import { type ActiveBlock, log } from "@flows/shared";
import { useFlowsContext } from "../flows-context";

interface Props {
  block: ActiveBlock;
}

export const TourBlock: FC<Props> = ({ block }) => {
  const { tourComponents } = useFlowsContext();

  const Component = tourComponents[block.component];
  if (!Component) {
    log.error(`Tour Component not found for tour block "${block.component}"`);
    return null;
  }

  return <Component {...block.props} />;
};
