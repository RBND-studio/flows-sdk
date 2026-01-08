import { type ButtonSize, type ButtonVariant } from "@flows/shared";
import { clsx } from "clsx";
import { type FC, type ReactNode } from "react";

interface Props {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  variant: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  target?: "_blank";
}

export const Button: FC<Props> = ({ className, variant, size = "default", ...props }) => {
  const Cmp = props.href ? "a" : "button";

  return (
    <Cmp
      type={Cmp === "button" ? "button" : undefined}
      className={clsx(
        "flows_basicsV2_button",
        `flows_basicsV2_button_${variant}`,
        `flows_basicsV2_button_size_${size}`,
        className,
      )}
      {...props}
    />
  );
};
