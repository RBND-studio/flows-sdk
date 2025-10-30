import { type FC } from "react";
import { type ComponentProps, type TooltipProps as LibraryTooltipProps } from "@flows/shared";
import { BaseTooltip } from "../internal-components/base-tooltip";
import { Button } from "../internal-components/button";

export type TooltipProps = ComponentProps<LibraryTooltipProps>;

export const Tooltip: FC<TooltipProps> = (props) => {
  const buttons = [];
  if (props.continueText)
    buttons.push(
      <Button key="continue" variant="primary" onClick={props.continue}>
        {props.continueText}
      </Button>,
    );

  return (
    <BaseTooltip
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      placement={props.placement}
      overlay={!props.hideOverlay}
      onClose={props.showCloseButton ? props.close : undefined}
      buttons={buttons.length ? buttons : undefined}
    />
  );
};
