import {
  debugEnabledSessionStorageKey,
  getDefaultDebugEnabled,
  isDebugShortcut,
} from "@flows/shared";

const tagName = "flows-debug-panel";

const openDebugPanel = async (): Promise<void> => {
  if (document.querySelector(tagName)) return;

  const { DebugPanel } = await import("../debug/debug-panel");

  if (!customElements.get(tagName)) {
    customElements.define(tagName, DebugPanel);
  }
  const debugPanelEl = document.createElement(tagName);
  document.body.appendChild(debugPanelEl);
};

export const createKeydownDebugListener =
  (onDebugKeydown?: (event: KeyboardEvent) => boolean) =>
  (e: KeyboardEvent): void => {
    const shortcutMatcher = onDebugKeydown ?? isDebugShortcut;
    if (shortcutMatcher(e)) {
      void openDebugPanel();
      sessionStorage.setItem(debugEnabledSessionStorageKey, "true");
    }
  };

export const initDebugPanel = (enabled?: boolean): void => {
  if (getDefaultDebugEnabled(enabled)) {
    return void openDebugPanel();
  }
};
