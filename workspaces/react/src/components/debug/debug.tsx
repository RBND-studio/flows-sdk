import { lazy, useEffect, useState, type FC } from "react";
import { debugEnabledSessionStorageKey, isDebugShortcut, localhostRegex } from "@flows/shared";
import { type DebugPanelProps } from "./debug-panel";

const DebugPanel = lazy(() => import("./debug-panel"));

const getDefaultEnabled = (forced?: boolean): boolean => {
  const isSessionEnabled = sessionStorage.getItem(debugEnabledSessionStorageKey) === "true";
  const isLocalhost = localhostRegex.test(window.location.origin);
  return forced ?? (isSessionEnabled || isLocalhost);
};

export const Debug: FC<Props> = (props) => {
  const [firstRender, setFirstRender] = useState(true);
  useEffect(() => {
    setFirstRender(false);
  }, []);

  if (firstRender) return null;

  return <DebugInner {...props} />;
};

type Props = {
  enabled?: boolean;
  onDebugKeydown?: (event: KeyboardEvent) => boolean;
} & DebugPanelProps;

const DebugInner: FC<Props> = ({ enabled: forceEnabled, onDebugKeydown, ...props }) => {
  const [enabled, setEnabled] = useState(getDefaultEnabled(forceEnabled));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const shortcutMatcher = onDebugKeydown ?? isDebugShortcut;
      if (shortcutMatcher(e)) {
        setEnabled(true);
        sessionStorage.setItem(debugEnabledSessionStorageKey, "true");
      }
    };

    addEventListener("keydown", handleKeyDown);
    return () => {
      removeEventListener("keydown", handleKeyDown);
    };
  }, [onDebugKeydown]);

  if (!enabled) return null;

  return <DebugPanel {...props} />;
};
