import { type Block } from "@flows/shared";
import { type ReactNode } from "react";
import { DebugSection } from "../debug-section";

interface Props {
  blocks: Block[];
  activeBlockCount: number;
  panelState: string;
  onClose: () => void;
}

export const BlocksPanel = ({
  blocks,
  activeBlockCount,
  panelState,
  onClose,
}: Props): ReactNode => {
  if (panelState === "blocks") {
    return (
      <DebugSection onClose={onClose} label="Blocks">
        <p className="flows-debug-info-line">
          <strong>Loaded blocks:</strong> {blocks.length}
        </p>

        <p className="flows-debug-info-line">
          <strong>Active blocks:</strong> {activeBlockCount}
        </p>

        <p className="flows-debug-info-line">
          <strong>Blocks JSON:</strong>
        </p>

        <pre className="flows-debug-code-block">{JSON.stringify(blocks, null, 2)}</pre>
        <button
          className="flows-debug-button-secondary flows-debug-print-button"
          onClick={() => {
            // eslint-disable-next-line no-console -- feature for debugging
            console.log(blocks);
          }}
          type="button"
        >
          Print to console
        </button>
      </DebugSection>
    );
  }
  return null;
};
