import clsx from "clsx";
import type { ChangeEventHandler, FC, FocusEventHandler, HTMLInputTypeAttribute, Ref } from "react";

type Props = {
  as?: "input" | "textarea";
  type?: HTMLInputTypeAttribute;
  onChange?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  className?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  ref?: Ref<HTMLInputElement | HTMLTextAreaElement>;
};

export const Input: FC<Props> = ({ as = "input", className, ref, ...props }) => {
  const Cmp = as;

  return (
    <Cmp className={clsx("flows_basicsV2_input", className)} {...props} ref={ref as Ref<any>} />
  );
};
