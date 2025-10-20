import { useMemo, type FC } from "react";
import { type TourTooltipProps, type TourComponentProps } from "@flows/shared";
import { BaseTooltip } from "../internal-components/base-tooltip";
import { ActionButton } from "../internal-components/action-button";

export type TooltipProps = TourComponentProps<TourTooltipProps>;

export const Tooltip: FC<TooltipProps> = (props) => {
  // const previousButton = props.previous && props.previousText && (
  //   <Button variant="secondary" onClick={props.previous}>
  //     {props.previousText}
  //   </Button>
  // );
  // const continueButton = props.continueText && (
  //   <Button variant="primary" onClick={props.continue}>
  //     {props.continueText}
  //   </Button>
  // );
  // const buttons =
  //   Boolean(continueButton) || Boolean(previousButton) ? (
  //     <>
  //       {/* The empty div ensures elements are aligned correctly when there is no continue button */}
  //       {previousButton ?? <div aria-hidden />}
  //       {continueButton ?? <div aria-hidden />}
  //     </>
  //   ) : null;

  const buttons = useMemo(
    () =>
      props.buttons.map((b, i) => (
        <ActionButton
          action={b.action}
          variant={b.variant}
          // eslint-disable-next-line react/no-array-index-key -- no better key available
          key={i}
        />
      )),
    [props.buttons],
  );

  return (
    <BaseTooltip
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      placement={props.placement}
      overlay={!props.hideOverlay}
      onClose={props.showCloseButton ? props.cancel : undefined}
      // buttons={buttons}
      buttons={buttons}
    />
  );
};
