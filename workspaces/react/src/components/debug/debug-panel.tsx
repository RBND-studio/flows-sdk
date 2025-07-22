import { type ChangeEvent, useState, type FC, useMemo } from "react";
import {
  type DebugPanelPosition,
  debugPanelPositionLocalStorageKey,
  debugPanelPositionOptions,
  getDefaultDebugPanelPosition,
  type UserProperties,
} from "@flows/shared";
import debugStyles from "@flows/styles/debug.css";
import { useFlowsContext } from "../../flows-context";
import { useVisibleBlocks } from "../../hooks/use-current-blocks";
import { LogoPillSvg } from "./logo";

const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const booleanToString = (value: unknown): "true" | "false" => (value ? "true" : "false");

const t = {
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
    true: "API working correctly.",
    false: "API is not working correctly. Check the browser console for more details.",
  },
};

export interface DebugPanelProps {
  organizationId: string;
  environment: string;
  userId: string;
  userProperties?: UserProperties;

  blocksError: boolean;
  wsError: boolean;
}

const DebugPanel: FC<DebugPanelProps> = ({
  blocksError,
  wsError,
  environment,
  organizationId,
  userId,
  userProperties,
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<DebugPanelPosition>(getDefaultDebugPanelPosition());
  const handleChangePosition = (e: ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as DebugPanelPosition;
    setPosition(value);
    localStorage.setItem(debugPanelPositionLocalStorageKey, value);
  };
  const { runningTours, blocks } = useFlowsContext();
  const visibleBlocks = useVisibleBlocks();
  const activeBlockCount = useMemo(() => {
    const activeWorkflowBlockCount = visibleBlocks.filter((b) => b.type === "component").length;
    const activeTourCount = runningTours.filter((tour) => Boolean(tour.activeStep)).length;
    return activeWorkflowBlockCount + activeTourCount;
  }, [runningTours, visibleBlocks]);

  const statusItems = [
    {
      key: "organizationId",
      valid: organizationId && uuidv4Regex.test(organizationId),
    },
    { key: "userId", valid: Boolean(userId) },
    { key: "environment", valid: Boolean(environment) },
    { key: "apiError", valid: !blocksError && !wsError },
  ] as const;

  return (
    <div className={`flows-debug flows-debug-${position}`}>
      <button
        className="flows-debug-menu"
        type="button"
        onClick={() => {
          setOpen((p) => !p);
        }}
      >
        <LogoPillSvg width={16} />
      </button>
      {open ? (
        <div className="flows-debug-popover">
          <ul>
            {statusItems.map((item) => {
              const indicator = item.valid ? "✅" : "❌";
              const message = t[item.key][booleanToString(item.valid)];
              return (
                <li key={item.key}>
                  {indicator} {message}
                </li>
              );
            })}
          </ul>
          <hr />
          <ul>
            <li>
              OrganizationId: <code>{organizationId}</code>
            </li>
            <li>
              Environment: <code>{environment}</code>
            </li>
            <li>
              userId: <code>{userId}</code>
            </li>
            <li>
              User properties:{" "}
              <pre className="mono">{JSON.stringify(userProperties ?? {}, null, 2)}</pre>
            </li>
            <li>Loaded blocks: {blocks.length}</li>
            <li>Active blocks: {activeBlockCount}</li>
          </ul>
          <hr />
          <label>
            Position
            <select value={position} onChange={handleChangePosition}>
              {debugPanelPositionOptions.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <style>{debugStyles}</style>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export -- using default export because this components will be dynamically imported
export default DebugPanel;
