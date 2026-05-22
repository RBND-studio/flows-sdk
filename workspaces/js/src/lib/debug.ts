import {
  debugEnabledSessionStorageKey,
  getDefaultDebugEnabled,
  isDebugShortcut,
  log,
} from "@flows/shared";
import { effect, signal } from "@preact/signals-core";
import { type DebugPanel } from "../debug/debug-panel";

const tagName = "flows-debug-panel";

const debugPanelOpen = signal<{ enabled: boolean; forceOpen: boolean }>({
  enabled: false,
  forceOpen: false,
});

const openDebugPanel = async (): Promise<void> => {
  // Ensure this methods runs only in the browser environment
  if (typeof window === "undefined") return;

  if (document.querySelector(tagName)) return;

  try {
    const { DebugPanel } = await import("../debug/debug-panel");
    if (!customElements.get(tagName)) {
      customElements.define(tagName, DebugPanel);
    }
    const debugPanelEl = document.createElement(tagName) as DebugPanel;
    debugPanelEl.forceOpen = debugPanelOpen.value.forceOpen;
    document.body.appendChild(debugPanelEl);
  } catch (error) {
    log.error("Failed to load the DebugPanel module", error);
  }
};
const closeDebugPanel = (): void => {
  // Ensure this methods runs only in the browser environment
  if (typeof window === "undefined") return;

  const debugPanelEl = document.querySelector(tagName);
  if (debugPanelEl) {
    debugPanelEl.remove();
  }
};

effect(() => {
  const debugPanelOpenValue = debugPanelOpen.value;

  if (debugPanelOpenValue.enabled) {
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
      const newValue = !debugPanelOpen.value.enabled;
      sessionStorage.setItem(debugEnabledSessionStorageKey, String(newValue));

      // Info log for user feedback
      if (newValue) log.info(`Debug mode enabled`);
      else log.info(`Debug mode disabled`);

      debugPanelOpen.value = {
        enabled: newValue,
        // Force open is set to true when enabling debug mode via keyboard shortcut
        forceOpen: newValue,
      };
    }
  };

export const initDebugPanel = (enabled?: boolean): void => {
  debugPanelOpen.value = { enabled: getDefaultDebugEnabled(enabled), forceOpen: false };
};
