import { type ActiveBlock, addSlotBlocksChangeListener, getCurrentSlotBlocks } from "@flows/js";
import { LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { html, unsafeStatic } from "lit/static-html.js";
import { spreadProps } from "./spread-props";
import { components, tourComponents } from "./components-store";

export class FlowsSlot extends LitElement {
  @state()
  private _blocks: ActiveBlock[] = [];
  private _changeListenerDispose?: () => void;

  @property({ type: String })
  slotId: string;

  connectedCallback(): void {
    this._blocks = getCurrentSlotBlocks(this.slotId);
    this._changeListenerDispose = addSlotBlocksChangeListener(this.slotId, (blocks) => {
      this._blocks = blocks;
    });
  }

  disconnectedCallback(): void {
    this._changeListenerDispose?.();
  }

  get placeholderElement(): HTMLElement | null {
    return this.querySelector("[data-placeholder]");
  }

  createRenderRoot(): this {
    return this;
  }

  render(): unknown {
    if (this.placeholderElement) {
      if (this._blocks.length) this.placeholderElement.hidden = true;
      else this.placeholderElement.hidden = false;
    }

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
