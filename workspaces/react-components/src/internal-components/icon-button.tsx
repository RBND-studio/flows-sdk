import { type FC, type ReactNode } from "react";
import { clsx } from "clsx";

interface Props {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
}

export const IconButton: FC<Props> = ({ className, ...props }) => {
  return (
    <button type="button" className={clsx("flows_basicsV2_iconButton", className)} {...props} />
  );
};
