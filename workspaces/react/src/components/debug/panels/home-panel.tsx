import { type PanelPage, type Block, dashboardLink } from "@flows/shared";
import { type FC } from "react";
import { DebugItem } from "../debug-item";
import { packageAndVersion } from "../../../lib/constants";

interface Props {
  userId: string;
  setPanelPage: (page: PanelPage) => void;
  sdkSetupValid: boolean;
  blocks: Block[];
  activeBlockCount: number;
  organizationId: string;
  pathname?: string;
}

export const HomePanel: FC<Props> = ({
  userId,
  setPanelPage,
  sdkSetupValid,
  blocks,
  activeBlockCount,
  pathname,
  organizationId,
}) => {
  return (
    <div className="flows-debug-popover-narrow">
      <div className="flows-debug-item-list">
        <DebugItem
          label="User"
          secondary={userId ? <code className="flows-debug-inline-code">{userId}</code> : "Not set"}
          onClick={() => {
            setPanelPage("user");
          }}
        />
        <DebugItem
          label="SDK setup"
          secondary={
            sdkSetupValid ? "Valid" : <span className="flows-debug-validation-invalid">Error</span>
          }
          onClick={() => {
            setPanelPage("sdk-setup");
          }}
        />
        <DebugItem
          label="Blocks"
          secondary={`${blocks.length} loaded, ${activeBlockCount} active`}
          onClick={() => {
            setPanelPage("blocks");
          }}
        />
        <DebugItem
          label="Pathname"
          secondary={pathname}
          onClick={() => {
            setPanelPage("pathname");
          }}
        />
      </div>
      <hr />
      <div className="flows-debug-item-list">
        <DebugItem
          label="Settings"
          secondary={packageAndVersion}
          onClick={() => {
            setPanelPage("settings");
          }}
        />
        <a
          href={dashboardLink(organizationId)}
          target="_blank"
          rel="noopener noreferrer"
          className="flows-debug-item flows-debug-item-interactive flows-debug-item-label"
        >
          Open Flows dashboard
        </a>
      </div>
    </div>
  );
};
