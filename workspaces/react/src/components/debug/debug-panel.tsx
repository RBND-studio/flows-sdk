import { useState, type FC, useMemo } from "react";
import {
  type DebugPanelPosition,
  getDefaultDebugPanelPosition,
  type UserProperties,
} from "@flows/shared";
import debugStyles from "@flows/styles/debug.css";
import { useFlowsContext } from "../../flows-context";
import { useVisibleBlocks } from "../../hooks/use-current-blocks";
import { Logo } from "./icons/logo";
import { UserPanel } from "./panels/user-panel";
import { SdkSetupPanel } from "./panels/sdk-setup-panel";
import { BlocksPanel } from "./panels/blocks-panel";
import { HomePanel } from "./panels/main-panel";
import { SettingsPanel } from "./panels/settings-panel";
import { Check } from "./icons/check";
import { X } from "./icons/x";

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
  const [open, setOpen] = useState(true);

  const [panelState, setPanelState] = useState("home");
  const closeSubPanel = (): void => {
    setPanelState("home");
  };

  const [position, setPosition] = useState<DebugPanelPosition>(getDefaultDebugPanelPosition());
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

  const sdkSetupValid = statusItems.every((item) => item.valid);

  return (
    <div className={`flows-debug flows-debug-${position}`}>
      <button
        className={`flows-debug-menu ${sdkSetupValid ? "" : " flows-debug-menu-error"}`}
        type="button"
        onClick={() => {
          setOpen((p) => !p);
        }}
      >
        <div
          className={`flows-debug-menu-inset ${sdkSetupValid ? "" : "flows-debug-menu-inset-error"}`}
        >
          <Logo width={16} />
        </div>
      </button>
      {open ? (
        <div className="flows-debug-popover">
          <HomePanel
            userId={userId}
            setPanelState={setPanelState}
            sdkSetupValid={sdkSetupValid}
            blocks={blocks}
            activeBlockCount={activeBlockCount}
            panelState={panelState}
            organizationId={organizationId}
          />
          <UserPanel
            panelState={panelState}
            onClose={closeSubPanel}
            userProperties={userProperties}
            userId={userId}
          />
          <SdkSetupPanel
            panelState={panelState}
            onClose={closeSubPanel}
            organizationId={organizationId}
            environment={environment}
            statusItems={statusItems.map((item) => {
              const indicator = item.valid ? (
                <Check className="flows-debug-validation-valid" />
              ) : (
                <X className="flows-debug-validation-invalid" />
              );
              const message = t[item.key][booleanToString(item.valid)];
              return (
                <div className="flows-debug-validation-item" key={item.key}>
                  {indicator} <p>{message}</p>
                </div>
              );
            })}
          />
          <BlocksPanel
            panelState={panelState}
            onClose={closeSubPanel}
            blocks={blocks}
            activeBlockCount={activeBlockCount}
          />
          <SettingsPanel
            panelState={panelState}
            onClose={closeSubPanel}
            position={position}
            setPosition={setPosition}
          />
        </div>
      ) : null}

      <style>{debugStyles}</style>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export -- using default export because this components will be dynamically imported
export default DebugPanel;
