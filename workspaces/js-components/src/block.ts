import { logMissingComponentError, type ActiveBlock } from "@flows/shared";
import { html, unsafeStatic } from "lit/static-html.js";
import { components, surveyComponents, tourComponents } from "./components-store";
import { spreadProps } from "./spread-props";

interface Props {
  block: ActiveBlock;
}

export const Block = ({ block }: Props): unknown => {
  const Component = (() => {
    if (block.type === "component") return components[block.component];
    if (block.type === "tour-component") return tourComponents[block.component];
    if (block.type === "survey") return surveyComponents[block.component];
    return undefined;
  })();

  // Log error if component is missing
  if (!Component) logMissingComponentError(block);

  if (!Component) return null;

  const tagName = customElements.getName(Component);
  if (!tagName) return null;

  return html`<${unsafeStatic(tagName)} ${spreadProps(block.props)} />`;
};
