import { type Action } from "@flows/shared";
import { type ReactNode, type FC } from "react";
import { Close16 } from "../icons/close16";
import { Text } from "./text";
import { ActionButton } from "./action-button";
import { IconButton } from "./icon-button";

interface Props {
  title: string;
  body: string;

  dots?: ReactNode;
  primaryButton?: Action;
  secondaryButton?: Action;
  width?: string;
  tour: boolean;

  onClose?: () => void;
}

export const BaseCard: FC<Props> = (props) => {
  const buttons = [];
  if (props.primaryButton)
    buttons.push(<ActionButton key="primary" action={props.primaryButton} variant="primary" />);
  if (props.secondaryButton)
    buttons.push(
      <ActionButton key="secondary" action={props.secondaryButton} variant="secondary" />,
    );

  if (props.tour) buttons.reverse();

  const cardWidth = (() => {
    if (Number(props.width) === 0) return undefined;
    if (Number.isNaN(Number(props.width))) return props.width;
    return `${props.width}px`;
  })();

  return (
    <div
      className="flows_basicsV2_card"
      style={{
        width: "100%",
        maxWidth: cardWidth,
      }}
    >
      <Text variant="title">{props.title}</Text>
      <Text variant="body" dangerouslySetInnerHTML={{ __html: props.body }} />

      {!props.tour && buttons.length ? (
        <div className="flows_basicsV2_card_footer">
          <div className="flows_basicsV2_card_buttons">{buttons}</div>
        </div>
      ) : null}

      {props.tour && (props.dots ?? buttons.length) ? (
        <div className="flows_basicsV2_card_footer">
          {props.dots}
          {buttons.length ? (
            <div className="flows_basicsV2_card_buttons_wrapper">
              <div className="flows_basicsV2_card_buttons">{buttons}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {props.onClose ? (
        <IconButton
          aria-label="Close"
          className="flows_basicsV2_card_close"
          onClick={props.onClose}
        >
          <Close16 />
        </IconButton>
      ) : null}
    </div>
  );
};
