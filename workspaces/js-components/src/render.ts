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
import type { SurveyComponents } from "./types";
import { type Components, type TourComponents } from "./types";
import { components, jsMethods, surveyComponents, tourComponents } from "./components-store";
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
  surveyComponents: SurveyComponents;

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
 * import * as surveyComponents from "@flows/js-components/survey-components";
 *
 * setupJsComponents({
 *   components: { ...components },
 *   tourComponents: { ...tourComponents },
 *   surveyComponents: { ...surveyComponents },
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

  const elements = [
    ...Object.entries(options.components).map(([name, Cmp]) => {
      components[name] = Cmp;
      const tagName = `flows-${name.toLowerCase()}`;
      return [tagName, Cmp] as const;
    }),
    ...Object.entries(options.tourComponents).map(([name, Cmp]) => {
      tourComponents[name] = Cmp;
      const tagName = `flows-tour-${name.toLowerCase()}`;
      return [tagName, Cmp] as const;
    }),
    ...Object.entries(options.surveyComponents).map(([name, Cmp]) => {
      surveyComponents[name] = Cmp;
      const tagName = `flows-survey-${name.toLowerCase()}`;
      return [tagName, Cmp] as const;
    }),
  ];

  elements.forEach(([tagName, Cmp]) => {
    // Element may be already defined
    if (customElements.get(tagName)) return;
    // Element with the same class may be already defined
    if (customElements.getName(Cmp)) return;

    customElements.define(tagName, Cmp);
  });

  const floatingBlocksTag = "flows-floating-blocks";
  const slotTag = "flows-slot";
  if (!customElements.get(floatingBlocksTag))
    customElements.define(floatingBlocksTag, FlowsFloatingBlocks);
  if (!customElements.get(slotTag)) customElements.define(slotTag, FlowsSlot);
};
