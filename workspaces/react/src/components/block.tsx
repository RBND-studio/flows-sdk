import { useEffect, type FC } from "react";
import { type ActiveBlock, logMissingComponentError } from "@flows/shared";
import { useFlowsContext } from "../flows-context";

interface Props {
  block: ActiveBlock;
}

export const Block: FC<Props> = ({ block }) => {
  const { components, tourComponents } = useFlowsContext();

  const Component = (() => {
    if (block.type === "component") return components[block.component];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- block types can be added in the future
    if (block.type === "tour-component") return tourComponents[block.component];
    return undefined;
  })();

  // Log error if component is missing
  useEffect(() => {
    if (!Component) logMissingComponentError({ component: block.component, type: block.type });
  }, [Component, block.component, block.type]);

  if (!Component) return null;
  return <Component {...block.props} />;
};
