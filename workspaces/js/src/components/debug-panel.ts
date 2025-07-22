import { html, LitElement, type TemplateResult, css, unsafeCSS } from "lit";
import { state } from "lit/decorators.js";
import debugStyles from "@flows/styles/debug.css";
import {
  DebugPanelPosition,
  debugPanelPositionLocalStorageKey,
  debugPanelPositionOptions,
  getDefaultDebugPanelPosition,
} from "@flows/shared";

export class DebugPanel extends LitElement {
  @state()
  private accessor _open = false;

  @state()
  private accessor _position: DebugPanelPosition = getDefaultDebugPanelPosition();

  private _handleOpen(): void {
    this._open = !this._open;
  }

  private _handlePositionChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    const value = select.value;
    this._position = value as DebugPanelPosition;
    localStorage.setItem(debugPanelPositionLocalStorageKey, value);
  }

  static styles = css`
    ${unsafeCSS(debugStyles)}
  `;

  render(): TemplateResult {
    const content = html`<div class="flows-debug-popover">
      Debug panel content

      <label>
        Position
        <select @change="${this._handlePositionChange.bind(this)}">
          ${debugPanelPositionOptions.map(
            (opt) =>
              html`<option ?selected="${this._position === opt.value}" value="${opt.value}">
                ${opt.label}
              </option>`,
          )}
        </select>
      </label>
    </div>`;

    return html`<div class="flows-debug flows-debug-${this._position}">
      <button class="flows-debug-menu" type="button" @click="${this._handleOpen.bind(this)}">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          width="16"
          height="16"
          viewBox="0 0 40 40"
        >
          <path
            d="M38.02 12.24C36.7 10 34.87 8.22 32.56 6.94C30.38 5.74 27.83 5.08 25 5H16C12.97 5 9.76 5.66 7.45 6.94C5.14 8.22 3.3 10 1.99 12.23C0.67 14.46 0 17.08 0 20.02C0 22.96 0.67 25.53 1.99 27.76C3.3 29.99 5.15 31.78 7.47 33.05C9.8 34.33 12.94 35 16 35H25C27.81 34.94 30.4 34.26 32.6 33.05C34.91 31.77 36.74 29.99 38.04 27.76C39.34 25.52 40 22.92 40 20.01C40 17.1 39.33 14.48 38.02 12.24ZM30.3 19.89L27.37 22.82C26.63 23.56 25.62 24 24.58 24H19.95C18.9 24 17.9 24.39 17.16 25.13L16.12 26C13.19 28.46 8.72 26.37 8.72 22.55C8.72 21.65 9.08 20.79 9.71 20.16L12.64 17.23C13.38 16.49 14.4 16 15.45 16H20.08C21.13 16 22.12 15.66 22.86 14.92L23.79 14.09C26.65 11.53 31.2 13.5 31.29 17.34V17.5C31.29 18.4 30.94 19.26 30.3 19.89Z"
          />
        </svg>
      </button>
      ${this._open ? content : null}
    </div> `;
  }
}
