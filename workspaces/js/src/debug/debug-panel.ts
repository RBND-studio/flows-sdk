import { html, LitElement, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import debugStyles from "@flows/styles/debug.css";
import {
  booleanToString,
  type DebugPanelPosition,
  debugPanelPositionLocalStorageKey,
  getDefaultDebugPanelPosition,
  type PanelPage,
  t,
  uuidV4Regex,
} from "@flows/shared";
import { clsx } from "clsx";
import { SignalWatcher } from "@lit-labs/preact-signals";
import { blocks, blocksError, config, pathname, wsError } from "../store";
import { visibleBlocks, visibleTours } from "../computed";
import { Logo } from "./icons/logo";
import { DebugSection } from "./debug-section";
import { SettingsPanel } from "./panels/settings-panel";
import { UserPanel } from "./panels/user-panel";
import { HomePanel } from "./panels/home-panel";
import { BlocksPanel } from "./panels/blocks-panel";
import { SdkSetupPanel } from "./panels/sdk-setup-panel";
import { Check } from "./icons/check";
import { X } from "./icons/x";
import { PathnamePanel } from "./panels/pathname-panel";

export class DebugPanel extends SignalWatcher(LitElement) {
  @state()
  private accessor _open = false;

  @state()
  private accessor _position: DebugPanelPosition = getDefaultDebugPanelPosition();

  @state()
  private accessor _page: PanelPage | undefined = undefined;

  private _toggleOpen(): void {
    this._open = !this._open;
  }

  private _handlePositionChange(value: DebugPanelPosition): void {
    this._position = value;
    localStorage.setItem(debugPanelPositionLocalStorageKey, value);
  }

  private _handlePageChange(page?: PanelPage): void {
    this._page = page;
  }

  createRenderRoot(): this {
    return this;
  }
  render(): TemplateResult {
    const orgId = config.value?.organizationId;
    const userId = config.value?.userId;
    const environment = config.value?.environment;
    const blocksValue = blocks.value;
    const activeBlockCount = visibleBlocks.value.length + visibleTours.value.length;
    const pathnameValue = pathname.value;

    const statusItems = [
      { key: "organizationId", valid: orgId && uuidV4Regex.test(orgId) },
      { key: "userId", valid: Boolean(userId) },
      { key: "environment", valid: Boolean(environment) },
      { key: "apiError", valid: !blocksError.value && !wsError.value },
    ] as const;
    const sdkSetupValid = statusItems.every((item) => item.valid);

    const content = (() => {
      if (this._page === "user")
        return UserPanel({
          userId: config.value?.userId ?? "",
          userProperties: config.value?.userProperties,
        });
      if (this._page === "blocks") return BlocksPanel({ activeBlockCount, blocks: blocksValue });
      if (this._page === "sdk-setup")
        return SdkSetupPanel({
          environment: config.value?.environment ?? "",
          organizationId: config.value?.organizationId ?? "",
          statusItems: html`${statusItems.map((item) => {
            const indicator = item.valid
              ? Check({ className: "flows-debug-validation-valid" })
              : X({ className: "flows-debug-validation-invalid" });
            const message = t[item.key][booleanToString(item.valid)];
            return html`<div class="flows-debug-validation-item">
              ${indicator}
              <p>${message}</p>
            </div>`;
          })}`,
        });
      if (this._page === "pathname") return PathnamePanel({ pathname: pathnameValue });
      if (this._page === "settings")
        return SettingsPanel({
          position: this._position,
          onPositionChange: this._handlePositionChange.bind(this),
        });

      return HomePanel({
        blocks: blocksValue,
        activeBlockCount,
        userId: config.value?.userId ?? "",
        organizationId: config.value?.organizationId ?? "",
        sdkSetupValid,
        setPanelPage: this._handlePageChange.bind(this),
        pathname: pathname.value ?? "",
      });
    })();

    return html`<div class=${clsx("flows-debug", `flows-debug-${this._position}`)}>
      <button
        class=${clsx(
          "flows-debug-btn flows-debug-menu",
          !sdkSetupValid && "flows-debug-menu-error",
        )}
        type="button"
        @click="${this._toggleOpen.bind(this)}"
      >
        <div
          class=${clsx("flows-debug-menu-inset", !sdkSetupValid && "flows-debug-menu-inset-error")}
        >
          ${Logo()}
        </div>
      </button>
      ${this._open
        ? html`<div class="flows-debug-popover">
            ${Layout({
              children: content,
              onClose: () => {
                this._handlePageChange(undefined);
              },
              page: this._page,
            })}
          </div>`
        : null}
      <style>
        ${debugStyles}
      </style>
    </div> `;
  }
}

const Layout = ({
  children,
  onClose,
  page,
}: {
  children: TemplateResult;
  page?: PanelPage;
  onClose: () => void;
}): TemplateResult => {
  if (!page) return children;

  return DebugSection({ children, label: t.title[page], onClose });
};
