import { type ActiveBlock, addSlotBlocksChangeListener, getCurrentSlotBlocks } from "@flows/js";
import { type Components } from "./types";

let components: Components = {};

interface MountedElement {
  el: HTMLElement;
  blockId: string;
  cleanup: () => void;
}

class FlowsSlot extends HTMLElement {
  mountedElements: MountedElement[] = [];
  blocks: ActiveBlock[] = [];
  changeListenerDispose: (() => void) | undefined;

  get slotId(): string {
    return this.getAttribute("slot-id") ?? "";
  }

  connectedCallback(): void {
    this.blocks = getCurrentSlotBlocks(this.slotId);
    this.changeListenerDispose = addSlotBlocksChangeListener(this.slotId, (blocks) => {
      this.blocks = blocks;
      this.render();
    });

    this.render();
  }

  disconnectedCallback(): void {
    this.changeListenerDispose?.();
    this.unmount();
  }

  render(): void {
    this.unmount();

    this.blocks.forEach((block) => {
      if (block.type === "component") {
        const Cmp = components[block.component];
        if (Cmp) {
          const { cleanup, element: el } = Cmp(block.props);
          this.mountedElements.push({ el, cleanup, blockId: block.id });
          this.appendChild(el);
        }
      }
    });
  }

  unmount(): void {
    this.mountedElements.forEach((mountedElement) => {
      mountedElement.cleanup();
      mountedElement.el.remove();
    });
    this.mountedElements = [];
  }
}

interface Props {
  components: Components;
}
/**
 * This method is used to register custom `<flows-slot>` element as well as updating the components that can be rendered inside the slot.
 */
export const updateSlotComponents = (props: Props): void => {
  if (!customElements.get("flows-slot")) customElements.define("flows-slot", FlowsSlot);

  components = props.components;
};
