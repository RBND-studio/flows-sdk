export interface MountedElement {
  el: HTMLElement | null;
  blockId: string;
  cleanup: () => void;
}
