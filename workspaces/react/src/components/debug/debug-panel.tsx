import { useState, type FC, useMemo, type ReactNode } from "react";
import {
  type DebugPanelPosition,
  getDefaultDebugPanelPosition,
  type UserProperties,
} from "@flows/shared";
import debugStyles from "@flows/styles/debug.css";
import { clsx } from "clsx";
import { useFlowsContext } from "../../flows-context";
import { useVisibleBlocks } from "../../hooks/use-current-blocks";
import { Logo } from "./icons/logo";
import { UserPanel } from "./panels/user-panel";
import { SdkSetupPanel } from "./panels/sdk-setup-panel";
import { BlocksPanel } from "./panels/blocks-panel";
import { HomePanel } from "./panels/home-panel";
import { SettingsPanel } from "./panels/settings-panel";
import { Check } from "./icons/check";
import { X } from "./icons/x";
import { type PanelPage } from "./panels/panel-page";
import { DebugSection } from "./debug-section";

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
  title: {
    user: "User Information",
    "sdk-setup": "SDK Setup",
    blocks: "Blocks",
    settings: "Settings",
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
  const toggleOpen = (): void => {
    setOpen((p) => !p);
  };

  const [panelPage, setPanelPage] = useState<PanelPage>();
  const closeSubPanel = (): void => {
    setPanelPage(undefined);
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

  const content = (() => {
    if (panelPage === "user") return <UserPanel userProperties={userProperties} userId={userId} />;
    if (panelPage === "sdk-setup")
      return (
        <SdkSetupPanel
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
      );
    if (panelPage === "blocks")
      return <BlocksPanel blocks={blocks} activeBlockCount={activeBlockCount} />;
    if (panelPage === "settings")
      return <SettingsPanel position={position} setPosition={setPosition} />;

    return (
      <HomePanel
        userId={userId}
        setPanelPage={setPanelPage}
        sdkSetupValid={sdkSetupValid}
        blocks={blocks}
        activeBlockCount={activeBlockCount}
        organizationId={organizationId}
      />
    );
  })();

  return (
    <div className={clsx("flows-debug", `flows-debug-${position}`)}>
      <button
        className={clsx("flows-debug-menu", !sdkSetupValid && "flows-debug-menu-error")}
        type="button"
        onClick={toggleOpen}
      >
        <div
          className={clsx(
            "flows-debug-menu-inset",
            !sdkSetupValid && "flows-debug-menu-inset-error",
          )}
        >
          <Logo width={16} />
        </div>
      </button>
      {open ? (
        <div className="flows-debug-popover">
          <Layout page={panelPage} onClose={closeSubPanel}>
            {content}
          </Layout>
        </div>
      ) : null}

      <style>{debugStyles}</style>
    </div>
  );
};

const Layout: FC<{ children: ReactNode; page?: PanelPage; onClose: () => void }> = ({
  children,
  page,
  onClose,
}) => {
  if (!page) return children;

  return (
    <DebugSection label={t.title[page]} onClose={onClose}>
      {children}
    </DebugSection>
  );
};

// eslint-disable-next-line import/no-default-export -- using default export because this components will be dynamically imported
export default DebugPanel;
