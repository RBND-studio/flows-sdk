import {
  addFloatingBlocksChangeListener,
  type addSlotBlocksChangeListener,
  getCurrentFloatingBlocks,
  type getCurrentSlotBlocks,
} from "@flows/js";
import { LitElement } from "lit";
import { state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { html, unsafeStatic } from "lit/static-html.js";
import { type ActiveBlock } from "@flows/shared";
import { type Components, type TourComponents } from "./types";
import { spreadProps } from "./spread-props";
import { components, jsMethods, tourComponents } from "./components-store";
import { FlowsSlot } from "./slot";

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
    return repeat(
      this._blocks,
      (b) => {
        if (b.type === "tour-component") return b.tourBlockId;
        return b.id;
      },
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

    const tagName = `flows-${name.toLowerCase()}`;
    if (!customElements.get(tagName)) {
      customElements.define(tagName, Cmp);
    }
  });

  Object.entries(options.tourComponents).forEach(([name, Cmp]) => {
    tourComponents[name] = Cmp;

    // Component may be already defined if it's also used for `components`
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
