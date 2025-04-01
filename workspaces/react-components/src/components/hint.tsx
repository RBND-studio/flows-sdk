import { type Placement, type ComponentProps } from "@flows/shared";
import { type FC } from "react";
import { BaseHint } from "../internal-components/base-hint";

type Props = ComponentProps<{
  title: string;
  body: string;

  targetElement: string;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;

  continue: () => void;
  close: () => void;
}>;

export const Hint: FC<Props> = (props) => {
  return (
    <BaseHint
      title={props.title}
      body={props.body}
      targetElement={props.targetElement}
      offsetX={props.offsetX}
      offsetY={props.offsetY}
      placement={props.placement}
      // onClose={}
    />
  );
};
