import { type TemplateResult } from "lit";
import { type ButtonSize, type Action, type ButtonVariant } from "@flows/shared";
import { Button } from "./button";

interface Props {
  action: Action;
  variant: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
}

export const ActionButton = ({ action, variant, onClick, size }: Props): TemplateResult => {
  const handleClick = (): void => {
    onClick?.();
    void action.callAction?.();
  };

  return Button({
    variant,
    size,
    href: action.url,
    target: action.openInNew ? "_blank" : undefined,
    onClick: handleClick,
    children: action.label,
  });
};
