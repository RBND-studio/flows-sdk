import classNames from "classnames";
import { type FC, type ReactNode } from "react";

interface Props {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  variant: "primary" | "secondary";
}

export const Button: FC<Props> = ({ className, variant, ...props }) => {
  return (
    <button
      type="button"
      className={classNames("flows_button", `flows_button_${variant}`, className)}
      {...props}
    />
  );
};
