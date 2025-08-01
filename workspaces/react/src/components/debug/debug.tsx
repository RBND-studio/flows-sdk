import { lazy, useEffect, useState, type FC } from "react";
import {
  debugEnabledSessionStorageKey,
  getDefaultDebugEnabled,
  isDebugShortcut,
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
} & DebugPanelProps;

const DebugInner: FC<Props> = ({ enabled: forceEnabled, onDebugKeydown, ...props }) => {
  const [enabled, setEnabled] = useState(getDefaultDebugEnabled(forceEnabled));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const shortcutMatcher = onDebugKeydown ?? isDebugShortcut;
      if (shortcutMatcher(e)) {
        setEnabled((prev) => {
          const newValue = !prev;
          sessionStorage.setItem(debugEnabledSessionStorageKey, String(newValue));
          return newValue;
        });
      }
    };

    addEventListener("keydown", handleKeyDown);
    return () => {
      removeEventListener("keydown", handleKeyDown);
    };
  }, [onDebugKeydown]);

  if (!enabled) return null;

  return (
    <ErrorBoundary>
      <DebugPanel {...props} />
    </ErrorBoundary>
  );
};
