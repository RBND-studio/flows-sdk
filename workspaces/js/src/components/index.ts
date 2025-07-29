import { type DebugPanel } from "../debug/debug-panel";

export * from "../debug/debug-panel";

declare global {
  interface HTMLElementTagNameMap {
    "debug-panel": DebugPanel;
  }
}
