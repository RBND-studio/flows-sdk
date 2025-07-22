export const localhostRegex = /^https?:\/\/localhost/;

export const debugEnabledSessionStorageKey = "flows-debug-enabled";
export const debugPanelPositionLocalStorageKey = "flows-debug-position";

export type DebugPanelPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export const debugPanelPositionOptions: { value: DebugPanelPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];
export const getDefaultDebugPanelPosition = (): DebugPanelPosition => {
  const lsValue = localStorage.getItem(debugPanelPositionLocalStorageKey);
  if (debugPanelPositionOptions.some((option) => option.value === lsValue)) {
    return lsValue as DebugPanelPosition;
  }
  return "bottom-right";
};
