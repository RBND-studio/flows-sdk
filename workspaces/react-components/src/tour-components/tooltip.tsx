import { type FC } from "react";
import { type TourTooltipProps, type TourComponentProps } from "@flows/shared";
import { BaseTooltip } from "../internal-components/base-tooltip";
import { ActionButton } from "../internal-components/action-button";
import { Dots } from "../internal-components/dots";

export type TooltipProps = TourComponentProps<TourTooltipProps>;

const Tooltip: FC<TooltipProps> = (props) => {
  const primaryBtn = props.primaryButton ? (
    <ActionButton action={props.primaryButton} variant="primary" />
  ) : null;
  const secondaryBtn = props.secondaryButton ? (
    <ActionButton action={props.secondaryButton} variant="secondary" />
  ) : null;
  const buttons =
    Boolean(primaryBtn) || Boolean(secondaryBtn) ? (
      <>
        {secondaryBtn ?? <div aria-hidden />}
        {primaryBtn ?? <div aria-hidden />}
      </>
    ) : null;

  const dots = !props.hideProgress ? (
    <Dots
      count={props.__flows.tourVisibleStepCount ?? 0}
      index={props.__flows.tourVisibleStepIndex ?? 0}
    />
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
      dots={dots}
    />
  );
};

export const BasicsV2Tooltip = Tooltip;
