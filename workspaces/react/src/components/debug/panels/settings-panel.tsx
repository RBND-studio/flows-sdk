import { type ChangeEvent, type ReactNode } from "react";
import { type DebugPanelPosition, debugPanelPositionOptions, docsLink } from "@flows/shared";
import { ChevronDown } from "../icons/chevron-down";
import { packageAndVersion } from "../../../lib/constants";

interface Props {
  position: DebugPanelPosition;
  onPositionChange: (value: DebugPanelPosition) => void;
}

export const SettingsPanel = ({ position, onPositionChange }: Props): ReactNode => {
  const handlePositionChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as DebugPanelPosition;
    onPositionChange(value);
  };

  return (
    <>
      <div className="flows-debug-item">
        <div>
          <label className="flows-debug-item-label" htmlFor="debug-panel-position">
            Position
          </label>
          <p className="flows-debug-item-info">
            Sets the position of the debug panel on the screen.
          </p>
        </div>
        <div className="flows-debug-select-wrap">
          <select
            className="flows-debug-select"
            value={position}
            id="debug-panel-position"
            onChange={handlePositionChange}
          >
            {debugPanelPositionOptions.map((opt) => (
              <option value={opt.value} key={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown />
        </div>
      </div>
      <div className="flows-debug-item">
        <div>
          <p className="flows-debug-item-label">Debug panel shortcut</p>
          <p className="flows-debug-item-info">
            Used to toggle the panel visibility even when debug mode is not active.
          </p>
        </div>
        {/* FIXME: add correct shortcut */}
        <div className="flows-debug-shortcut-list">
          <p className="flows-debug-shortcut">Cmd</p>
          <p className="flows-debug-shortcut">Option</p>
          <p className="flows-debug-shortcut">Shift</p>
          <p className="flows-debug-shortcut">F</p>
        </div>
      </div>
      <div className="flows-debug-item">
        <div>
          <p className="flows-debug-item-label">Docs</p>
          <p className="flows-debug-item-info">
            Learn more about the debug panel and its features.
          </p>
        </div>
        <a
          className="flows-debug-button-secondary"
          href={docsLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open docs
        </a>
      </div>
      <div className="flows-debug-item">
        <div>
          <p className="flows-debug-item-label">SDK version</p>
          <p className="flows-debug-item-info">
            Make sure to keep your SDK up to date for the best experience.
          </p>
        </div>
        <p>{packageAndVersion}</p>
      </div>
    </>
  );
};
