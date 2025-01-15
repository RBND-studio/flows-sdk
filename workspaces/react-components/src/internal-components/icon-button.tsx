import { type FC, type ReactNode } from "react";
import classNames from "classnames";

interface Props {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
}

export const IconButton: FC<Props> = ({ className, ...props }) => {
  return <button type="button" className={classNames("flows_iconButton", className)} {...props} />;
};
