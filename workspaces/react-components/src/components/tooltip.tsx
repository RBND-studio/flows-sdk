import { type FC } from "react";
import { type ComponentProps, type TooltipProps as LibraryTooltipProps } from "@flows/shared";
import { BaseTooltip } from "../internal-components/base-tooltip";
import { ActionButton } from "../internal-components/action-button";

export type TooltipProps = ComponentProps<LibraryTooltipProps>;

const Tooltip: FC<TooltipProps> = (props) => {
  const buttons = [];
  if (props.secondaryButton)
    buttons.push(
      <ActionButton key="secondary" action={props.secondaryButton} variant="secondary" />,
    );
  if (props.primaryButton)
    buttons.push(<ActionButton key="primary" action={props.primaryButton} variant="primary" />);

  return (
    <BaseTooltip
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      placement={props.placement}
      overlay={!props.hideOverlay}
      onClose={props.dismissible ? props.close : undefined}
      buttons={buttons.length ? buttons : undefined}
    />
  );
};

export const BasicsV2Tooltip = Tooltip;
