import { type TourHintProps, type TourComponentProps } from "@flows/shared";
import { type FC } from "react";
import { BaseHint } from "../internal-components/base-hint";
import { ActionButton } from "../internal-components/action-button";

export type HintProps = TourComponentProps<TourHintProps>;

export const Hint: FC<HintProps> = (props) => {
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
    <BaseHint
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      offsetX={props.offsetX}
      offsetY={props.offsetY}
      placement={props.placement}
      onClose={props.dismissible ? props.cancel : undefined}
      buttons={buttons}
      // Needed to avoid reusing html elements between tour steps. Otherwise the tooltip exit animation is triggered.
      key={props.__flows.id}
    />
  );
};
