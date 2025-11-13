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
import { FlowsSlot } from "./slot";

class FlowsFloatingBlocks extends LitElement {
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
