import { useEffect, type FC } from "react";
import { type ActiveBlock, log } from "@flows/shared";
import { useFlowsContext } from "../flows-context";

interface Props {
  block: ActiveBlock;
}

export const Block: FC<Props> = ({ block }) => {
  const { components } = useFlowsContext();

  const Component = components[block.component];

  useEffect(() => {
    if (!Component) log.error(`Component not found for workflow block "${block.component}"`);
  }, [Component, block.component]);

  if (!Component) return null;
  return <Component {...block.props} />;
};
