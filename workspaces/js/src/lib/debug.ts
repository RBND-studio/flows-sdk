import {
  debugEnabledSessionStorageKey,
  getDefaultDebugEnabled,
  isDebugShortcut,
} from "@flows/shared";
import { effect, signal } from "@preact/signals-core";

const tagName = "flows-debug-panel";

const debugPanelOpen = signal(false);

const openDebugPanel = async (): Promise<void> => {
  if (document.querySelector(tagName)) return;

  const { DebugPanel } = await import("../debug/debug-panel");
  if (!customElements.get(tagName)) {
    customElements.define(tagName, DebugPanel);
  }
  const debugPanelEl = document.createElement(tagName);
  document.body.appendChild(debugPanelEl);
};
const closeDebugPanel = (): void => {
  const debugPanelEl = document.querySelector(tagName);
  if (debugPanelEl) {
    debugPanelEl.remove();
  }
};

effect(() => {
  const debugPanelOpenValue = debugPanelOpen.value;

  if (debugPanelOpenValue) {
    void openDebugPanel();
  } else {
    closeDebugPanel();
  }
});

export const createKeydownDebugListener =
  (onDebugKeydown?: (event: KeyboardEvent) => boolean) =>
  (e: KeyboardEvent): void => {
    const shortcutMatcher = onDebugKeydown ?? isDebugShortcut;
    if (shortcutMatcher(e)) {
      const newValue = !debugPanelOpen.value;
      sessionStorage.setItem(debugEnabledSessionStorageKey, String(newValue));
      debugPanelOpen.value = newValue;
    }
  };

export const initDebugPanel = (enabled?: boolean): void => {
  debugPanelOpen.value = getDefaultDebugEnabled(enabled);
};
