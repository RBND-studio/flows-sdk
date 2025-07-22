import { debugEnabledSessionStorageKey, localhostRegex } from "@flows/shared";

const openDebugPanel = async (): Promise<void> => {
  if (document.querySelector("debug-panel")) return;

  const { DebugPanel } = await import("../components/debug-panel");

  if (!customElements.get("debug-panel")) {
    customElements.define("debug-panel", DebugPanel);
  }
  const debugPanelEl = document.createElement("debug-panel");
  document.body.appendChild(debugPanelEl);
};

export const keydownDebugListener = (e: KeyboardEvent): void => {
  if (e.key.toLowerCase() === "f" && e.ctrlKey && e.shiftKey) {
    void openDebugPanel();
    sessionStorage.setItem(debugEnabledSessionStorageKey, "true");
  }
};

export const initDebugPanel = (enabled?: boolean): void => {
  const isLocalhost = localhostRegex.test(window.location.origin);
  const isSessionEnabled = sessionStorage.getItem(debugEnabledSessionStorageKey) === "true";

  if (enabled ?? (isSessionEnabled || isLocalhost)) {
    return void openDebugPanel();
  }
};
