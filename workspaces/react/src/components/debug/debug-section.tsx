import { type ReactNode } from "react";
import { ArrowLeft } from "./icons/arrow-left";

interface Props {
  label: string;
  children: ReactNode;
  onClose: () => void;
}

export const DebugSection = ({ label, children, onClose }: Props): ReactNode => {
  return (
    <div className="flows-debug-popover-wide">
      <div className="flows-debug-section-header">
        <button
          className="flows-debug-btn flows-debug-section-close"
          onClick={onClose}
          type="button"
        >
          <ArrowLeft />
        </button>
        <p className="flows-debug-section-label">{label}</p>
      </div>
      <div className="flows-debug-section-content">{children}</div>
    </div>
  );
};
