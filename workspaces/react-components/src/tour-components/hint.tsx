import { type Placement, type TourComponentProps } from "@flows/shared";
import { type FC } from "react";
import { BaseHint } from "../internal-components/base-hint";
import { Button } from "../internal-components/button";

type Props = TourComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  previousText?: string;
  showCloseButton: boolean;

  targetElement: string;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;
}>;

export const Hint: FC<Props> = (props) => {
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
    <BaseHint
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      offsetX={props.offsetX}
      offsetY={props.offsetY}
      placement={props.placement}
      onClose={props.showCloseButton ? props.cancel : undefined}
      buttons={buttons}
      // Needed to avoid reusing html elements between tour steps. Otherwise the tooltip exit animation is triggered.
      key={props.__flows.id}
    />
  );
};
