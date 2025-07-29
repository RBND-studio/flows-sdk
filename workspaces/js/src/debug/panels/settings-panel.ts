import { debugPanelPositionOptions, docsLink, type DebugPanelPosition } from "@flows/shared";
import { type TemplateResult, html } from "lit";
import { packageAndVersion } from "../../lib/constants";
import { ChevronDown } from "../icons/chevron-down";

interface Props {
  position: DebugPanelPosition;
  onPositionChange: (position: DebugPanelPosition) => void;
}

export const SettingsPanel = ({ position, onPositionChange }: Props): TemplateResult => {
  const handlePositionChange = (e: Event): void => {
    const value = (e.target as HTMLSelectElement).value as DebugPanelPosition;
    onPositionChange(value);
  };

  return html`
    <div class="flows-debug-item">
      <div>
        <label class="flows-debug-item-label" htmlFor="debug-panel-position"> Position </label>
        <p class="flows-debug-item-info">Sets the position of the debug panel on the screen.</p>
      </div>
      <div class="flows-debug-select-wrap">
        <select
          class="flows-debug-select"
          id="debug-panel-position"
          @change=${handlePositionChange}
        >
          ${debugPanelPositionOptions.map(
            (opt) =>
              html`<option ?selected=${opt.value === position} value=${opt.value}>
                ${opt.label}
              </option>`,
          )}
        </select>
        ${ChevronDown()}
      </div>
    </div>
    <div class="flows-debug-item">
      <div>
        <p class="flows-debug-item-label">Debug panel shortcut</p>
        <p class="flows-debug-item-info">
          Used to toggle the panel visibility even when debug mode is not active.
        </p>
      </div>
      {/* FIXME: add correct shortcut */}
      <div class="flows-debug-shortcut-list">
        <p class="flows-debug-shortcut">Cmd</p>
        <p class="flows-debug-shortcut">Option</p>
        <p class="flows-debug-shortcut">Shift</p>
        <p class="flows-debug-shortcut">F</p>
      </div>
    </div>
    <div class="flows-debug-item">
      <div>
        <p class="flows-debug-item-label">Docs</p>
        <p class="flows-debug-item-info">Learn more about the debug panel and its features.</p>
      </div>
      <a
        class="flows-debug-button-secondary"
        href=${docsLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open docs
      </a>
    </div>
    <div class="flows-debug-item">
      <div>
        <p class="flows-debug-item-label">SDK version</p>
        <p class="flows-debug-item-info">
          Make sure to keep your SDK up to date for the best experience.
        </p>
      </div>
      <p>${packageAndVersion}</p>
    </div>
  `;
};
