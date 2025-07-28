import { type Block } from "@flows/shared";
import { type ReactNode } from "react";

interface Props {
  blocks: Block[];
  activeBlockCount: number;
}

export const BlocksPanel = ({ blocks, activeBlockCount }: Props): ReactNode => {
  return (
    <>
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
    </>
  );
};
