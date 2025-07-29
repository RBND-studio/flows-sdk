import { type ReactNode } from "react";

interface Props {
  label: string;
  secondary?: ReactNode;
  onClick?: () => void;
}

export const DebugItem = ({ label, secondary, onClick }: Props): ReactNode => {
  return (
    <button
      className="flows-debug-btn flows-debug-item flows-debug-item-interactive"
      onClick={onClick}
      type="button"
    >
      <span className="flows-debug-item-label">{label}</span>
      {secondary ? <span className="flows-debug-item-secondary">{secondary}</span> : null}
    </button>
  );
};
