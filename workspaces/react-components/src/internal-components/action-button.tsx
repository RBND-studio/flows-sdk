import { type ButtonVariant, type Action, type ButtonSize } from "@flows/shared";
import { useCallback, type FC } from "react";
import { Button } from "./button";

interface Props {
  action: Action;
  variant: ButtonVariant;
  size?: ButtonSize;
}

export const ActionButton: FC<Props> = ({ action, variant, size }) => {
  const handleClick = useCallback(() => {
    void action.callAction?.();
  }, [action]);

  return (
    <Button
      variant={variant}
      size={size}
      href={action.url}
      target={action.openInNew ? "_blank" : undefined}
      onClick={handleClick}
    >
      {action.label}
    </Button>
  );
};
