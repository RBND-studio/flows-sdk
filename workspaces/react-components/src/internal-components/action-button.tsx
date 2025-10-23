import { type ButtonVariant, type Action } from "@flows/shared";
import { type FC, useCallback } from "react";
import { Button } from "./button";

interface Props {
  action: Action;
  variant: ButtonVariant;
}

export const ActionButton: FC<Props> = ({ action, variant }) => {
  const handleClick = useCallback(() => {
    void action.callAction?.();
  }, [action]);

  return (
    <Button
      variant={variant}
      href={action.url}
      target={action.openInNew ? "_blank" : undefined}
      onClick={handleClick}
    >
      {action.label}
    </Button>
  );
};
