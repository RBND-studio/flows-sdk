import { type FC } from "react";
import { type Placement } from "@floating-ui/react-dom";
import { BaseTooltip } from "../internal-components/tooltip";
import { Button } from "../internal-components/button";

export interface TooltipProps {
  title: string;
  body: string;
  continueText?: string;
  targetElement: string;
  showCloseButton: boolean;
  placement?: Placement;

  continue: () => void;
  close: () => void;
}

export const Tooltip: FC<TooltipProps> = (props) => {
  return (
    <BaseTooltip
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      placement={props.placement}
      onClose={props.showCloseButton ? props.close : undefined}
      buttons={
        props.continueText ? (
          <Button variant="primary" onClick={props.continue}>
            {props.continueText}
          </Button>
        ) : null
      }
    />
  );
};
