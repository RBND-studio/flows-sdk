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

const isInternalLink = (href: string, target?: Props["target"]): boolean => {
  if (target === "_blank") return false;
  try {
    const _url = new URL(href);
    return false;
  } catch {
    return true;
  }
};

export const Button: FC<Props> = ({
  className: classNameProp,
  variant,
  size = "default",
  ...props
}) => {
  const className = clsx(
    "flows_basicsV2_button",
    `flows_basicsV2_button_${variant}`,
    `flows_basicsV2_button_size_${size}`,
    classNameProp,
  );

  const LinkComponent = window.__flows_LinkComponent;
  const href = props.href;
  if (
    LinkComponent &&
    typeof LinkComponent === "function" &&
    href &&
    isInternalLink(href, props.target)
  ) {
    return <LinkComponent className={className} {...props} href={href} />;
  }

  const Cmp = props.href ? "a" : "button";

  return <Cmp type={Cmp === "button" ? "button" : undefined} className={className} {...props} />;
};
