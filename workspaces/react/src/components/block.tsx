import { useEffect, type FC } from "react";
import { type ActiveBlock, logMissingComponentError } from "@flows/shared";
import { useFlowsContext } from "../flows-context";

interface Props {
  block: ActiveBlock;
}

/**
 * Renders a single `ActiveBlock` using the matching component from `components`, `tourComponents`, or `surveyComponents` registered in `FlowsProvider`.
 *
 * `ActiveBlock` can be obtained from `useCurrentFloatingBlocks` or `useCurrentSlotBlocks`.
 *
 * Useful for advanced block rendering implementations.
 */
export const Block: FC<Props> = ({ block }) => {
  const { components, tourComponents, surveyComponents } = useFlowsContext();

  const Component = (() => {
    if (block.type === "component") return components[block.component];
    if (block.type === "tour-component") return tourComponents[block.component];
    if (block.type === "survey") return surveyComponents[block.component];
    return undefined;
  })();

  // Log error if component is missing
  useEffect(() => {
    if (!Component) logMissingComponentError({ component: block.component, type: block.type });
  }, [Component, block.component, block.type]);

  if (!Component) return null;
  return <Component {...block.props} />;
};
