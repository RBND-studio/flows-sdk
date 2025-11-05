import { type ComponentProps, type HintProps as LibraryHintProps } from "@flows/shared";
import { type FC } from "react";
import { BaseHint } from "../internal-components/base-hint";
import { ActionButton } from "../internal-components/action-button";

export type HintProps = ComponentProps<LibraryHintProps>;

const Hint: FC<HintProps> = (props) => {
  const buttons = [];
  if (props.secondaryButton)
    buttons.push(
      <ActionButton key="secondary" action={props.secondaryButton} variant="secondary" />,
    );
  if (props.primaryButton)
    buttons.push(<ActionButton key="primary" action={props.primaryButton} variant="primary" />);

  return (
    <BaseHint
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      offsetX={props.offsetX}
      offsetY={props.offsetY}
      placement={props.placement}
      onClose={props.dismissible ? props.close : undefined}
      buttons={buttons.length ? buttons : undefined}
    />
  );
};

export const BasicsV2Hint = Hint;
