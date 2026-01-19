import { type Action, type ButtonSize, type ButtonVariant } from "@flows/shared";
import { useCallback, type FC } from "react";
import { Button } from "./button";

interface Props {
  action: Action;
  variant: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  className?: string;
}

export const ActionButton: FC<Props> = ({ action, variant, size, onClick, className }) => {
  const handleClick = useCallback(() => {
    onClick?.();
    void action.callAction?.();
  }, [action, onClick]);

  return (
    <Button
      variant={variant}
      size={size}
      href={action.url}
      target={action.openInNew ? "_blank" : undefined}
      onClick={handleClick}
      className={className}
    >
      {action.label}
    </Button>
  );
};
