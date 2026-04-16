import clsx from "clsx";
import type { ChangeEventHandler, FC, FocusEventHandler, HTMLInputTypeAttribute } from "react";

type Props = {
  as?: "input" | "textarea";
  autoFocus?: boolean;
  type?: HTMLInputTypeAttribute;
  onChange?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  className?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
};

export const Input: FC<Props> = ({ as = "input", className, ...props }) => {
  const Cmp = as;

  return <Cmp className={clsx("flows_basicsV2_input", className)} {...props} />;
};
