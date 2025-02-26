import { type FC } from "react";
import { type ActiveBlock, log } from "@flows/shared";
import { useFlowsContext } from "../flows-context";

interface Props {
  block: ActiveBlock;
}

export const Block: FC<Props> = ({ block }) => {
  const { components } = useFlowsContext();

  const Component = components[block.component];
  if (!Component) {
    log.error(`Component not found for workflow block "${block.component}"`);
    return null;
  }

  return <Component key={block.id} />;
};
