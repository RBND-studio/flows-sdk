import { type FC } from "react";
import { type ComponentProps, type TooltipProps as LibraryTooltipProps } from "@flows/shared";
import { BaseTooltip } from "../internal-components/base-tooltip";

export type TooltipProps = ComponentProps<LibraryTooltipProps>;

const Tooltip: FC<TooltipProps> = (props) => {
  return (
    <BaseTooltip
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      placement={props.placement}
      overlay={!props.hideOverlay}
      onClose={props.dismissible ? props.close : undefined}
      primaryButton={props.primaryButton}
      secondaryButton={props.secondaryButton}
      LinkComponent={props.__flows.LinkComponent}
    />
  );
};

export const BasicsV2Tooltip = Tooltip;
