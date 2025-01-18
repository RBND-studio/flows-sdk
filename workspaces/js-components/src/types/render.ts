export interface MountedElement {
  el: HTMLElement;
  blockId: string;
  cleanup: () => void;
}
