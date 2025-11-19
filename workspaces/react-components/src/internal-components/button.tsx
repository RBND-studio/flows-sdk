import { type ButtonVariant } from "@flows/shared";
import { clsx } from "clsx";
import { type FC, type ReactNode } from "react";

interface Props {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  variant: ButtonVariant;
  href?: string;
  target?: "_blank";
}

export const Button: FC<Props> = ({ className, variant, ...props }) => {
  const Cmp = props.href ? "a" : "button";

  return (
    <Cmp
      type={Cmp === "button" ? "button" : undefined}
      className={clsx("flows_basicsV2_button", `flows_basicsV2_button_${variant}`, className)}
      {...props}
    />
  );
};
