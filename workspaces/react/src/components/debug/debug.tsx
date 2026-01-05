import { lazy, useEffect, useState, type FC } from "react";
import {
  debugEnabledSessionStorageKey,
  getDefaultDebugEnabled,
  isDebugShortcut,
  log,
} from "@flows/shared";
import { ErrorBoundary } from "../error-boundary";
import { type DebugPanelProps } from "./debug-panel";

const DebugPanel = lazy(() => import("./debug-panel"));

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
} & Omit<DebugPanelProps, "forceOpen">;

const DebugInner: FC<Props> = ({ enabled: forceEnabled, onDebugKeydown, ...props }) => {
  const [debugState, setDebugState] = useState<{ enabled: boolean; forceOpen: boolean }>({
    enabled: getDefaultDebugEnabled(forceEnabled),
    forceOpen: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const shortcutMatcher = onDebugKeydown ?? isDebugShortcut;
      if (shortcutMatcher(e)) {
        setDebugState((prev) => {
          const newValue = !prev.enabled;
          sessionStorage.setItem(debugEnabledSessionStorageKey, String(newValue));
          if (newValue) log.info(`Debug mode enabled`);
          else log.info(`Debug mode disabled`);
          return { enabled: newValue, forceOpen: newValue };
        });
      }
    };

    addEventListener("keydown", handleKeyDown);
    return () => {
      removeEventListener("keydown", handleKeyDown);
    };
  }, [onDebugKeydown]);

  if (!debugState.enabled) return null;

  return (
    <ErrorBoundary>
      <DebugPanel forceOpen={debugState.forceOpen} {...props} />
    </ErrorBoundary>
  );
};
