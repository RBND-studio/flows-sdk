import { type ComponentProps, type HintProps as LibraryHintProps } from "@flows/shared";
import { type FC } from "react";
import { BaseHint } from "../internal-components/base-hint";

export type HintProps = ComponentProps<LibraryHintProps>;

const Hint: FC<HintProps> = (props) => {
  return (
    <BaseHint
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      offsetX={props.offsetX}
      offsetY={props.offsetY}
      placement={props.placement}
      onClose={props.dismissible ? props.close : undefined}
      primaryButton={props.primaryButton}
      secondaryButton={props.secondaryButton}
      LinkComponent={props.__flows.LinkComponent}
    />
  );
};

export const BasicsV2Hint = Hint;
