import { type Action } from "@flows/shared";
import { type ReactNode, type FC } from "react";
import { Text } from "./text";
import { ActionButton } from "./action-button";

interface Props {
  title: string;
  body: string;

  dots?: ReactNode;
  primaryButton?: Action;
  secondaryButton?: Action;
}

export const BaseCard: FC<Props> = (props) => {
  const buttons = [];
  if (props.secondaryButton)
    buttons.push(
      <ActionButton key="secondary" action={props.secondaryButton} variant="secondary" />,
    );
  if (props.primaryButton)
    buttons.push(<ActionButton key="primary" action={props.primaryButton} variant="primary" />);

  return (
    <div className="flows_basicsV2_card">
      <Text variant="title">{props.title}</Text>
      <Text variant="body" dangerouslySetInnerHTML={{ __html: props.body }} />

      {props.dots ? <div className="flows_basicsV2_card_dots">{props.dots}</div> : null}

      {buttons.length ? <div className="flows_basicsV2_card_footer">{buttons}</div> : null}
    </div>
  );
};
