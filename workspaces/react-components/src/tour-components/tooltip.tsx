import { type FC } from "react";
import { type Placement, type TourComponentProps } from "@flows/shared";
import { BaseTooltip } from "../internal-components/base-tooltip";
import { Button } from "../internal-components/button";

export type TooltipProps = TourComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  previousText?: string;
  showCloseButton: boolean;
  targetElement: string;
  placement?: Placement;
  hideOverlay?: boolean;
}>;

export const Tooltip: FC<TooltipProps> = (props) => {
  const previousButton = props.previous && props.previousText && (
    <Button variant="secondary" onClick={props.previous}>
      {props.previousText}
    </Button>
  );
  const continueButton = props.continueText && (
    <Button variant="primary" onClick={props.continue}>
      {props.continueText}
    </Button>
  );
  const buttons =
    Boolean(continueButton) || Boolean(previousButton) ? (
      <>
        {/* The empty div ensures elements are aligned correctly when there is no continue button */}
        {previousButton ?? <div aria-hidden />}
        {continueButton ?? <div aria-hidden />}
      </>
    ) : null;

  return (
    <BaseTooltip
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      placement={props.placement}
      overlay={!props.hideOverlay}
      onClose={props.showCloseButton ? props.cancel : undefined}
      buttons={buttons}
    />
  );
};
