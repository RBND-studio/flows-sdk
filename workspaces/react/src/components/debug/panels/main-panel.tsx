import { type Block } from "@flows/shared";
import { type ReactNode } from "react";
import { DebugItem } from "../debug-item";
import { packageAndVersion } from "../../../lib/constants";

interface Props {
  userId: string;
  setPanelState: (state: string) => void;
  sdkSetupValid: boolean;
  blocks: Block[];
  activeBlockCount: number;
  panelState: string;
  organizationId: string;
}

export const HomePanel = ({
  userId,
  setPanelState,
  sdkSetupValid,
  blocks,
  activeBlockCount,
  panelState,
  organizationId,
}: Props): ReactNode => {
  if (panelState === "home") {
    return (
      <div className="flows-debug-popover-narrow">
        <div className="flows-debug-item-list">
          <DebugItem
            label="User"
            secondary={
              userId ? <code className="flows-debug-inline-code">{userId}</code> : "Not set"
            }
            onClick={() => {
              setPanelState("user");
            }}
          />
          <DebugItem
            label="SDK setup"
            secondary={
              sdkSetupValid ? (
                "Valid"
              ) : (
                <span className="flows-debug-validation-invalid">Invalid</span>
              )
            }
            onClick={() => {
              setPanelState("sdk-setup");
            }}
          />
          <DebugItem
            label="Blocks"
            secondary={`${blocks.length} loaded, ${activeBlockCount} active`}
            onClick={() => {
              setPanelState("blocks");
            }}
          />
        </div>
        <hr />
        <div className="flows-debug-item-list">
          <DebugItem
            label="Settings"
            secondary={packageAndVersion}
            onClick={() => {
              setPanelState("settings");
            }}
          />
          <a
            href={`https://app.flows.sh/org/${organizationId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flows-debug-item flows-debug-item-interactive flows-debug-item-label"
          >
            Open Flows dashboard
          </a>
        </div>
      </div>
    );
  }
  return null;
};
