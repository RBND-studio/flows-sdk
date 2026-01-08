import {
  addFloatingBlocksChangeListener,
  type addSlotBlocksChangeListener,
  getCurrentFloatingBlocks,
  type getCurrentSlotBlocks,
} from "@flows/js";
import { LitElement } from "lit";
import { state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { getBlockRenderKey, type ActiveBlock } from "@flows/shared";
import { type Components, type TourComponents } from "./types";
import { components, jsMethods, tourComponents } from "./components-store";
import { FlowsSlot } from "./slot";
import { Block } from "./block";

class FlowsFloatingBlocks extends LitElement {
  @state()
  private _blocks: ActiveBlock[] = [];
  private _changeListenerDispose?: () => void;

  connectedCallback(): void {
    super.connectedCallback();

    const _getCurrentFloatingBlocks =
      jsMethods.getCurrentFloatingBlocks ?? getCurrentFloatingBlocks;
    const _addFloatingBlocksChangeListener =
      jsMethods.addFloatingBlocksChangeListener ?? addFloatingBlocksChangeListener;

    this._blocks = _getCurrentFloatingBlocks();
    this._changeListenerDispose = _addFloatingBlocksChangeListener((blocks) => {
      this._blocks = blocks;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this._changeListenerDispose?.();
  }

  createRenderRoot(): this {
    return this;
  }

  render(): unknown {
    return repeat(this._blocks, getBlockRenderKey, (block) => {
      return Block({ block });
    });
  }
}

export interface SetupJsComponentsOptions {
  components: Components;
  tourComponents: TourComponents;

  /**
   * Optional method from `@flows/js` useful when its reference cannot be imported directly. e.g. in CDN usage.
   */
  addFloatingBlocksChangeListener?: typeof addFloatingBlocksChangeListener;
  /**
   * Optional method from `@flows/js` useful when its reference cannot be imported directly. e.g. in CDN usage.
   */
  getCurrentFloatingBlocks?: typeof getCurrentFloatingBlocks;
  /**
   * Optional method from `@flows/js` useful when its reference cannot be imported directly. e.g. in CDN usage.
   */
  addSlotBlocksChangeListener?: typeof addSlotBlocksChangeListener;
  /**
   * Optional method from `@flows/js` useful when its reference cannot be imported directly. e.g. in CDN usage.
   */
  getCurrentSlotBlocks?: typeof getCurrentSlotBlocks;
}

/**
 * Defines custom elements for `flows-floating-blocks`, `flows-slot` and all the passed UI Components.
 *
 * @param options - components and tour components to use for rendering
 * @example
 * ```js
 * import { setupJsComponents } from "@flows/js-components";
 * import * as components from "@flows/js-components/components";
 * import * as tourComponents from "@flows/js-components/tour-components";
 *
 * setupJsComponents({
 *   components: { ...components },
 *   tourComponents: { ...tourComponents },
 * });
 * ```
 * And add `<flows-floating-blocks>` at the end of the `<body>` tag:
 * ```html
 * <body>
 *   <!-- Your app content -->
 *   <flows-floating-blocks></flows-floating-blocks>
 * </body>
 * ```
 */
export const setupJsComponents = (options: SetupJsComponentsOptions): void => {
  if (options.addFloatingBlocksChangeListener)
    jsMethods.addFloatingBlocksChangeListener = options.addFloatingBlocksChangeListener;
  if (options.getCurrentFloatingBlocks)
    jsMethods.getCurrentFloatingBlocks = options.getCurrentFloatingBlocks;
  if (options.addSlotBlocksChangeListener)
    jsMethods.addSlotBlocksChangeListener = options.addSlotBlocksChangeListener;
  if (options.getCurrentSlotBlocks) jsMethods.getCurrentSlotBlocks = options.getCurrentSlotBlocks;

  Object.entries(options.components).forEach(([name, Cmp]) => {
    components[name] = Cmp;

    // Component may be already defined
    if (customElements.getName(Cmp)) return;

    const tagName = `flows-${name.toLowerCase()}`;
    if (!customElements.get(tagName)) {
      customElements.define(tagName, Cmp);
    }
  });

  Object.entries(options.tourComponents).forEach(([name, Cmp]) => {
    tourComponents[name] = Cmp;

    // Component may be already defined
    if (customElements.getName(Cmp)) return;

    const tagName = `flows-tour-${name.toLowerCase()}`;
    if (!customElements.get(tagName)) {
      customElements.define(tagName, Cmp);
    }
  });

  const floatingBlocksTag = "flows-floating-blocks";
  const slotTag = "flows-slot";
  if (!customElements.get(floatingBlocksTag))
    customElements.define(floatingBlocksTag, FlowsFloatingBlocks);
  if (!customElements.get(slotTag)) customElements.define(slotTag, FlowsSlot);
};
