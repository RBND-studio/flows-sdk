import { type ActiveBlock } from "@flows/js";
import { type Component } from "./types";

interface Props {
  blocks: ActiveBlock[];
  components: Record<string, Component>;
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
    if (block.type === "component") {
      const Cmp = props.components[block.component];
      if (Cmp) {
        const { cleanup, element: el } = Cmp(block.props);
        mountedElements.push({ el, cleanup, blockId: block.id });
        document.body.appendChild(el);
      }
    }
  });
};
