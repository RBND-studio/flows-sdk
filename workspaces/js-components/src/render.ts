import { type ActiveBlock } from "@flows/js";
import { type MountedElement, type Components, type TourComponents } from "./types";

export interface RenderOptions {
  blocks: ActiveBlock[];
  components: Components;
  tourComponents: TourComponents;
}

let mountedElements: MountedElement[] = [];

/**
 * Render floating blocks at the end of the body element. This function needs to be called every time the floating blocks change.
 *
 * @param options - active blocks to render and the components to render them with
 *
 * @example
 * ```js
 * import { addFloatingBlocksChangeListener } from "@flows/js";
 * import { render } from "@flows/js-components";
 * import * as components from "@flows/js-components/components";
 * import * as tourComponents from "@flows/js-components/tour-components";
 *
 * const dispose = addFloatingBlocksChangeListener((blocks) => {
 *   render({
 *     blocks,
 *     components: { ...components },
 *     tourComponents: { ...tourComponents },
 *   });
 * });
 *
 * // Call `dispose` when you want to stop listening to the changes to avoid memory leaks
 * dispose();
 * ```
 */
export const render = (options: RenderOptions): void => {
  mountedElements.forEach((mountedElement) => {
    mountedElement.cleanup();
    if (mountedElement.el) mountedElement.el.remove();
  });
  mountedElements = [];

  options.blocks.forEach((block) => {
    const Cmp = (() => {
      if (block.type === "component") return options.components[block.component];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- We need to check if the block is a tour component
      if (block.type === "tour-component") return options.tourComponents[block.component];
      return null;
    })();

    if (Cmp) {
      const { cleanup, element: el } = Cmp(block.props as Parameters<typeof Cmp>[0]);
      mountedElements.push({ el, cleanup, blockId: block.id });
      if (el) document.body.appendChild(el);
    }
  });
};
