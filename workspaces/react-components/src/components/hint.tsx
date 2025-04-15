import { type Placement, type ComponentProps } from "@flows/shared";
import { type FC } from "react";
import { BaseHint } from "../internal-components/base-hint";
import { Button } from "../internal-components/button";

export type HintProps = ComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  showCloseButton: boolean;

  targetElement: string;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;

  continue: () => void;
  close: () => void;
}>;

export const Hint: FC<HintProps> = (props) => {
  const buttons = [];
  if (props.continueText)
    buttons.push(
      <Button key="continue" variant="primary" onClick={props.continue}>
        {props.continueText}
      </Button>,
    );

  return (
    <BaseHint
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      offsetX={props.offsetX}
      offsetY={props.offsetY}
      placement={props.placement}
      onClose={props.showCloseButton ? props.close : undefined}
      buttons={buttons.length ? buttons : undefined}
    />
  );
};
