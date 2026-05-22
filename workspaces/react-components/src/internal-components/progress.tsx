import { clsx } from "clsx";
import { type FC } from "react";

interface Props {
  className?: string;
  value: number;
  max: number;
}

export const Progress: FC<Props> = ({ max, value, className }) => {
  const width = (value / max) * 100 || 0;

  return (
    <div
      className={clsx("flows_basicsV2_progress", className)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      role="progressbar"
    >
      <div className="flows_basicsV2_progress_indicator" style={{ width: `${width}%` }} />
    </div>
  );
};
