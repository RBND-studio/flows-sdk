import { type FC } from "react";
import { type TourTooltipProps, type TourComponentProps } from "@flows/shared";
import { BaseTooltip } from "../internal-components/base-tooltip";
import { Dots } from "../internal-components/dots";

export type TooltipProps = TourComponentProps<TourTooltipProps>;

const Tooltip: FC<TooltipProps> = (props) => {
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
      primaryButton={props.primaryButton}
      secondaryButton={props.secondaryButton}
      dots={dots}
    />
  );
};

export const BasicsV2Tooltip = Tooltip;
