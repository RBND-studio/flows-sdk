export const localhostRegex = /^https?:\/\/localhost/;
export const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const booleanToString = (value: unknown): "true" | "false" =>
  Boolean(value).toString() as "true" | "false";

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

export type PanelPage = "user" | "sdk-setup" | "blocks" | "pathname" | "settings";

export const t = {
  organizationId: {
    true: "Organization ID is valid.",
    false: "Organization ID is not valid.",
  },
  userId: {
    true: "User ID is set.",
    false: "User ID is not set.",
  },
  environment: {
    true: "Environment is set.",
    false: "Environment is not set.",
  },
  apiError: {
    true: "API responded successfully.",
    false: "API returned an error. Check the browser console for details.",
  },
  title: {
    user: "User Information",
    "sdk-setup": "SDK Setup",
    blocks: "Blocks",
    pathname: "Pathname",
    settings: "Settings",
  },
};

export const getDefaultDebugEnabled = (forced?: boolean): boolean => {
  if (typeof forced !== "undefined") return forced;
  const sessionValue = sessionStorage.getItem(debugEnabledSessionStorageKey);
  if (sessionValue) {
    return sessionValue === "true";
  }

  const isLocalhost = localhostRegex.test(window.location.origin);
  return isLocalhost;
};

export const dashboardLink = (organizationId: string): string =>
  `https://app.flows.sh/org/${organizationId}`;
export const docsLink = "https://flows.sh/docs/sdk-overview#debug-mode";

export const isMacLike = (): boolean => {
  if (typeof window === "undefined") return false;
  const isMac = navigator.userAgent.includes("Mac");
  const isIos = /(?:iphone|ipad|ipod)/i.test(navigator.userAgent);
  return isMac || isIos;
};
export const isDebugShortcut = (e: KeyboardEvent): boolean => {
  const cmdOrCtrl = isMacLike() ? e.metaKey : e.ctrlKey;
  return cmdOrCtrl && e.shiftKey && e.altKey && e.key.toLowerCase() === "f";
};
