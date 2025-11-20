import { type TemplateResult } from "lit";
import { type Action, type ButtonVariant } from "@flows/shared";
import { Button } from "./button";

interface Props {
  action: Action;
  variant: ButtonVariant;
}

export const ActionButton = ({ action, variant }: Props): TemplateResult => {
  const handleClick = (): void => {
    void action.callAction?.();
  };

  return Button({
    variant,
    href: action.url,
    target: action.openInNew ? "_blank" : undefined,
    onClick: handleClick,
    children: action.label,
  });
};
