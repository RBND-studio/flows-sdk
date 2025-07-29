import { type FC } from "react";

interface Props {
  pathname?: string;
}

export const PathnamePanel: FC<Props> = ({ pathname }) => {
  return (
    <>
      <p className="flows-debug-info-line">
        <strong>Pathname:</strong>
      </p>
      <p className="flows-debug-code-block flows-debug-info-line">{pathname}</p>
      <p className="flows-debug-info-line">
        This pathname is used when evaluating page targeting conditions.
      </p>
    </>
  );
};
