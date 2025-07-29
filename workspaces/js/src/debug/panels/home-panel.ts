import { dashboardLink, type Block, type PanelPage } from "@flows/shared";
import { html, type TemplateResult } from "lit";
import { packageAndVersion } from "../../lib/constants";
import { DebugItem } from "../debug-item";

interface Props {
  userId: string;
  setPanelPage: (page: PanelPage) => void;
  sdkSetupValid: boolean;
  blocks: Block[];
  activeBlockCount: number;
  organizationId: string;
  pathname: string;
}

export const HomePanel = ({
  activeBlockCount,
  blocks,
  organizationId,
  sdkSetupValid,
  setPanelPage,
  userId,
  pathname,
}: Props): TemplateResult => {
  return html`<div class="flows-debug-popover-narrow">
    <div class="flows-debug-item-list">
      ${DebugItem({
        label: "User",
        onClick: () => {
          setPanelPage("user");
        },
        secondary: userId
          ? html`<code class="flows-debug-inline-code">${userId}</code>`
          : "Not set",
      })}
      ${DebugItem({
        label: "SDK setup",
        onClick: () => {
          setPanelPage("sdk-setup");
        },
        secondary: sdkSetupValid
          ? "Valid"
          : html`<span class="flows-debug-validation-invalid">Invalid</span>`,
      })}
      ${DebugItem({
        label: "Blocks",
        onClick: () => {
          setPanelPage("blocks");
        },
        secondary: `${blocks.length} loaded, ${activeBlockCount} active`,
      })}
      ${DebugItem({
        label: "Pathname",
        onClick: () => {
          setPanelPage("pathname");
        },
        secondary: pathname,
      })}
    </div>
    <hr />
    <div class="flows-debug-item-list">
      ${DebugItem({
        label: "Settings",
        onClick: () => {
          setPanelPage("settings");
        },
        secondary: packageAndVersion,
      })}
      <a
        href=${dashboardLink(organizationId)}
        target="_blank"
        rel="noopener noreferrer"
        class="flows-debug-item flows-debug-item-interactive flows-debug-item-label"
      >
        Open Flows dashboard
      </a>
    </div>
  </div>`;
};
