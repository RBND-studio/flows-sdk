import { type TourHintProps, type TourComponentProps } from "@flows/shared";
import { type FC } from "react";
import { BaseHint } from "../internal-components/base-hint";
import { ActionButton } from "../internal-components/action-button";
import { Dots } from "../internal-components/dots";

export type HintProps = TourComponentProps<TourHintProps>;

const Hint: FC<HintProps> = (props) => {
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
    <BaseHint
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      offsetX={props.offsetX}
      offsetY={props.offsetY}
      placement={props.placement}
      onClose={props.dismissible ? props.cancel : undefined}
      buttons={buttons}
      dots={dots}
      // Needed to avoid reusing html elements between tour steps. Otherwise the tooltip exit animation is triggered.
      key={props.__flows.id}
    />
  );
};

export const BasicsV2Hint = Hint;
