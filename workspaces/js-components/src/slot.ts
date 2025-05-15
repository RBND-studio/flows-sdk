import { type ActiveBlock, addSlotBlocksChangeListener, getCurrentSlotBlocks } from "@flows/js";
import { type Components, type MountedElement, type TourComponents } from "./types";

let components: Components = {};
let tourComponents: TourComponents = {};

type AddSlotBlocksChangeListener = (
  slotId: string,
  callback: (items: ActiveBlock[]) => void,
) => () => void;

const defineFlowsSlot = (options: {
  addSlotBlocksChangeListener?: AddSlotBlocksChangeListener;
}): void => {
  // Don't run on server to prevent error because of missing browser APIs
  if (typeof window === "undefined") return;
  // Don't run if the element is already defined
  if (customElements.get("flows-slot")) return;

  class FlowsSlot extends HTMLElement {
    mountedElements: MountedElement[] = [];
    blocks: ActiveBlock[] = [];
    changeListenerDispose: (() => void) | undefined;

    get slotId(): string {
      return this.getAttribute("data-slot-id") ?? "";
    }

    get placeholderElement(): HTMLElement | null {
      return this.querySelector("[data-placeholder]");
    }

    connectedCallback(): void {
      this.blocks = getCurrentSlotBlocks(this.slotId);
      const addListener = options.addSlotBlocksChangeListener ?? addSlotBlocksChangeListener;
      this.changeListenerDispose = addListener(this.slotId, (blocks) => {
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

      if (this.placeholderElement) {
        if (this.blocks.length) this.placeholderElement.hidden = true;
        else this.placeholderElement.hidden = false;
      }

      this.blocks.forEach((block) => {
        const Cmp = (() => {
          if (block.type === "component") return components[block.component];
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- We need to check if the block is a tour component
          if (block.type === "tour-component") return tourComponents[block.component];
          return null;
        })();

        if (Cmp) {
          const { cleanup, element: el } = Cmp(block.props as Parameters<typeof Cmp>[0]);
          this.mountedElements.push({ el, cleanup, blockId: block.id });
          if (el) this.appendChild(el);
        }
      });
    }

    unmount(): void {
      this.mountedElements.forEach((mountedElement) => {
        mountedElement.cleanup();
        if (mountedElement.el) mountedElement.el.remove();
      });
      this.mountedElements = [];
    }
  }

  customElements.define("flows-slot", FlowsSlot);
};

export interface UpdateSlotComponentsOptions {
  components: Components;
  tourComponents: TourComponents;
  addSlotBlocksChangeListener?: AddSlotBlocksChangeListener;
}
/**
 * This method is used to register custom `<flows-slot>` element as well as updating the components that can be rendered inside the slot.
 *
 * @param options - with components and tourComponents available to be rendered inside the slot
 */
export const updateSlotComponents = (options: UpdateSlotComponentsOptions): void => {
  defineFlowsSlot({ addSlotBlocksChangeListener: options.addSlotBlocksChangeListener });

  components = options.components;
  tourComponents = options.tourComponents;
};
