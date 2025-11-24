import { addSlotBlocksChangeListener, getCurrentSlotBlocks } from "@flows/js";
import { LitElement } from "lit";
import { property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { getBlockRenderKey, type ActiveBlock } from "@flows/shared";
import { jsMethods } from "./components-store";
import { Block } from "./block";

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

    return repeat(this._blocks, getBlockRenderKey, (block) => {
      return Block({ block });
    });
  }
}
