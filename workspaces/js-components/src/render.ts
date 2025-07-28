import {
  addFloatingBlocksChangeListener,
  getCurrentFloatingBlocks,
  type ActiveBlock,
} from "@flows/js";
import { LitElement } from "lit";
import { state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { html, unsafeStatic } from "lit/static-html.js";
import { type Components, type TourComponents } from "./types";
import { spreadProps } from "./spread-props";
import { components, tourComponents } from "./components-store";

/**
 * Render floating blocks at the end of the body element. This function needs to be called every time the floating blocks change.
 *
 * @param options - active blocks to render and the components to render them with
 *
 * @example
 * ```js
 * import { addFloatingBlocksChangeListener } from "@flows/js";
 * import { render } from "@flows/js-comp onents";
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

export class FlowsFloatingBlocks extends LitElement {
  @state()
  private _blocks: ActiveBlock[] = [];
  private _changeListenerDispose?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this._blocks = getCurrentFloatingBlocks();
    this._changeListenerDispose = addFloatingBlocksChangeListener((blocks) => {
      this._blocks = blocks;
    });
  }

  disconnectedCallback(): void {
    this._changeListenerDispose?.();
  }

  createRenderRoot(): this {
    return this;
  }

  render(): unknown {
    return repeat(
      this._blocks,
      (b) => b.id,
      (block) => {
        const Cmp = (() => {
          if (block.type === "component") return components[block.component];
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- We need to check if the block is a tour component
          if (block.type === "tour-component") return tourComponents[block.component];
          return null;
        })();
        if (!Cmp) return null;
        const tagName = customElements.getName(Cmp);
        if (!tagName) return null;

        return html`<${unsafeStatic(tagName)} ${spreadProps(block.props)} />`;
      },
    );
  }
}

export interface SetupJsComponentsOptions {
  components: Components;
  tourComponents: TourComponents;
}

export const setupJsComponents = (options: SetupJsComponentsOptions): void => {
  Object.entries(options.components).forEach(([name, Cmp]) => {
    components[name] = Cmp;

    const tagName = `flows-${name.toLowerCase()}`;
    if (!customElements.get(tagName)) {
      customElements.define(tagName, Cmp);
    }
  });

  Object.entries(options.tourComponents).forEach(([name, Cmp]) => {
    tourComponents[name] = Cmp;

    const tagName = `flows-tour-${name.toLowerCase()}`;
    if (!customElements.get(tagName)) {
      customElements.define(tagName, Cmp);
    }
  });

  customElements.define("flows-floating-blocks", FlowsFloatingBlocks);
};
