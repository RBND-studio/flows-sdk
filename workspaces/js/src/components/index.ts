import { type DebugPanel } from "./debug-panel";

export * from "./debug-panel";

declare global {
  interface HTMLElementTagNameMap {
    "debug-panel": DebugPanel;
  }
}
