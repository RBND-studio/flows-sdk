import { lazy, useEffect, useState, type FC } from "react";
import { debugEnabledSessionStorageKey, localhostRegex } from "@flows/shared";
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
} & DebugPanelProps;

const DebugInner: FC<Props> = ({ enabled: forceEnabled, ...props }) => {
  const [enabled, setEnabled] = useState(getDefaultEnabled(forceEnabled));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key.toLowerCase() === "f" && e.ctrlKey && e.shiftKey) {
        setEnabled(true);
        sessionStorage.setItem(debugEnabledSessionStorageKey, "true");
      }
    };

    addEventListener("keydown", handleKeyDown);
    return () => {
      removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!enabled) return null;

  return <DebugPanel {...props} />;
};
