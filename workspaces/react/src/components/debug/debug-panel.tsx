import { useState, type FC, type ReactNode, useCallback } from "react";
import {
  booleanToString,
  type DebugPanelPosition,
  debugPanelPositionLocalStorageKey,
  getDefaultDebugPanelPosition,
  type PanelPage,
  t,
  type UserProperties,
  uuidV4Regex,
} from "@flows/shared";
import debugStyles from "@flows/styles/debug.css";
import { clsx } from "clsx";
import { useFlowsContext } from "../../flows-context";
import { usePathname } from "../../contexts/pathname-context";
import { Logo } from "./icons/logo";
import { UserPanel } from "./panels/user-panel";
import { SdkSetupPanel } from "./panels/sdk-setup-panel";
import { BlocksPanel } from "./panels/blocks-panel";
import { HomePanel } from "./panels/home-panel";
import { SettingsPanel } from "./panels/settings-panel";
import { Check } from "./icons/check";
import { X } from "./icons/x";
import { DebugSection } from "./debug-section";
import { PathnamePanel } from "./panels/pathname-panel";

export interface DebugPanelProps {
  forceOpen: boolean;

  organizationId: string;
  environment: string;
  userId: string;
  userProperties?: UserProperties;

  blocksError: boolean;
  wsError: boolean;
}

const DebugPanel: FC<DebugPanelProps> = ({
  forceOpen,
  blocksError,
  wsError,
  environment,
  organizationId,
  userId,
  userProperties,
}) => {
  const [open, setOpen] = useState(forceOpen);
  const toggleOpen = (): void => {
    setOpen((p) => !p);
  };

  const [panelPage, setPanelPage] = useState<PanelPage>();
  const closeSubPanel = (): void => {
    setPanelPage(undefined);
  };

  const [position, setPosition] = useState<DebugPanelPosition>(getDefaultDebugPanelPosition());
  const handleChangePosition = useCallback((value: DebugPanelPosition): void => {
    setPosition(value);
    localStorage.setItem(debugPanelPositionLocalStorageKey, value);
  }, []);

  const pathname = usePathname();
  const { blocks } = useFlowsContext();

  const statusItems = [
    { key: "organizationId", valid: organizationId && uuidV4Regex.test(organizationId) },
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
    if (panelPage === "blocks") return <BlocksPanel blocks={blocks} />;
    if (panelPage === "pathname") return <PathnamePanel pathname={pathname} />;
    if (panelPage === "settings")
      return <SettingsPanel position={position} onPositionChange={handleChangePosition} />;

    return (
      <HomePanel
        pathname={pathname}
        userId={userId}
        setPanelPage={setPanelPage}
        sdkSetupValid={sdkSetupValid}
        blocks={blocks}
        organizationId={organizationId}
      />
    );
  })();

  return (
    <div className={clsx("flows-debug", `flows-debug-${position}`)}>
      <button
        className={clsx(
          "flows-debug-btn",
          "flows-debug-menu",
          !sdkSetupValid && "flows-debug-menu-error",
        )}
        type="button"
        onClick={toggleOpen}
      >
        <div
          className={clsx(
            "flows-debug-menu-inset",
            !sdkSetupValid && "flows-debug-menu-inset-error",
          )}
        >
          <Logo />
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
