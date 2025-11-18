import { addSlotBlocksChangeListener, getCurrentSlotBlocks } from "@flows/js";
import { LitElement } from "lit";
import { property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { html, unsafeStatic } from "lit/static-html.js";
import { type ActiveBlock } from "@flows/shared";
import { spreadProps } from "./spread-props";
import { components, jsMethods, tourComponents } from "./components-store";

export class FlowsSlot extends LitElement {
  @state()
  private _blocks: ActiveBlock[] = [];
  private _changeListenerDispose?: () => void;

  @property({ type: String, attribute: "data-slot-id" })
  slotId: string;

  connectedCallback(): void {
    super.connectedCallback();

    const _getCurrentSlotBlocks = jsMethods.getCurrentSlotBlocks ?? getCurrentSlotBlocks;
    const _addSlotBlocksChangeListener =
      jsMethods.addSlotBlocksChangeListener ?? addSlotBlocksChangeListener;

    this._blocks = _getCurrentSlotBlocks(this.slotId);
    this._changeListenerDispose = _addSlotBlocksChangeListener(this.slotId, (blocks) => {
      this._blocks = blocks;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this._changeListenerDispose?.();
  }

  @query("[data-placeholder]")
  placeholderElement: HTMLElement | null;

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
