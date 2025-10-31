import { type FC } from "react";
import { type TourTooltipProps, type TourComponentProps } from "@flows/shared";
import { BaseTooltip } from "../internal-components/base-tooltip";
import { ActionButton } from "../internal-components/action-button";

export type TooltipProps = TourComponentProps<TourTooltipProps>;

export const Tooltip: FC<TooltipProps> = (props) => {
  const primaryBtn = props.primaryButton ? (
    <ActionButton action={props.primaryButton} variant="primary" />
  ) : null;
  const secondaryBtn = props.secondaryButton ? (
    <ActionButton action={props.secondaryButton} variant="secondary" />
  ) : null;
  const buttons =
    Boolean(primaryBtn) || Boolean(secondaryBtn) ? (
      <>
        {primaryBtn ?? <div aria-hidden />}
        {secondaryBtn ?? <div aria-hidden />}
      </>
    ) : null;

  return (
    <BaseTooltip
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      placement={props.placement}
      overlay={!props.hideOverlay}
      onClose={props.dismissible ? props.cancel : undefined}
      buttons={buttons}
    />
  );
};
