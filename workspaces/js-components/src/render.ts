import { type ActiveBlock } from "@flows/js";
import { type Components, type TourComponents } from "./types";

interface Props {
  blocks: ActiveBlock[];
  components: Components;
  tourComponents: TourComponents;
}

interface MountedElement {
  el: HTMLElement;
  blockId: string;
  cleanup: () => void;
}
let mountedElements: MountedElement[] = [];

export const render = (props: Props): void => {
  mountedElements.forEach((mountedElement) => {
    mountedElement.cleanup();
    mountedElement.el.remove();
  });
  mountedElements = [];

  props.blocks.forEach((block) => {
    const Cmp = (() => {
      if (block.type === "component") return props.components[block.component];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- We need to check if the block is a tour component
      if (block.type === "tour-component") return props.tourComponents[block.component];
      return null;
    })();

    if (Cmp) {
      const { cleanup, element: el } = Cmp(block.props as Parameters<typeof Cmp>[0]);
      mountedElements.push({ el, cleanup, blockId: block.id });
      document.body.appendChild(el);
    }
  });
};
