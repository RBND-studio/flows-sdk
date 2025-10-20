import { type ButtonVariant } from "@flows/shared";
import classNames from "classnames";
import { type FC, type ReactNode } from "react";

interface Props {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  variant: ButtonVariant;
  href?: string;
  target?: "_blank";
}

export const Button: FC<Props> = ({ className, variant, href, ...props }) => {
  const Cmp = href ? "a" : "button";

  return (
    <Cmp
      type="button"
      className={classNames("flows_button", `flows_button_${variant}`, className)}
      {...props}
    />
  );
};
