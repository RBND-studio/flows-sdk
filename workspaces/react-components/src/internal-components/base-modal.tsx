import { type ReactNode, type FC } from "react";
import classNames from "classnames";
import { type ModalButtonAlignment, type Action, type ModalPosition } from "@flows/shared";
import { Close16 } from "../icons/close16";
import { Text } from "./text";
import { IconButton } from "./icon-button";
import { ActionButton } from "./action-button";

interface Props {
  title: string;
  body: string;
  overlay: boolean;
  position?: ModalPosition;
  buttonAlignment?: ModalButtonAlignment;
  dots?: ReactNode;

  primaryButton?: Action;
  secondaryButton?: Action;
  onClose?: () => void;
}

export const BaseModal: FC<Props> = (props) => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- value can be empty string ""
  const position: ModalPosition = props.position || "center";
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- value can be empty string ""
  const buttonAlignment: ModalButtonAlignment = props.buttonAlignment || "center";

  const buttons = [];
  if (props.secondaryButton)
    buttons.push(
      <ActionButton key="secondary" action={props.secondaryButton} variant="secondary" />,
    );
  if (props.primaryButton)
    buttons.push(<ActionButton key="primary" action={props.primaryButton} variant="primary" />);

  return (
    <>
      {props.overlay ? (
        <div
          // TODO: fix flows_modal_clickable class, it should enable pointer events on the overlay
          className={classNames("flows_modal_overlay", props.onClose && "flows_modal_clickable")}
          onClick={props.onClose}
          aria-hidden="true"
        />
      ) : null}

      <div className="flows_modal_wrapper">
        <div className={classNames("flows_modal_modal", `flows_modal_${position}`)}>
          <Text variant="title">{props.title}</Text>
          <Text variant="body" dangerouslySetInnerHTML={{ __html: props.body }} />
          {props.dots}

          {buttons.length ? (
            <div
              className={classNames("flows_modal_footer", `flows_modal_footer_${buttonAlignment}`)}
            >
              {buttons}
            </div>
          ) : null}
          {props.onClose ? (
            <IconButton aria-label="Close" className="flows_modal_close" onClick={props.onClose}>
              <Close16 />
            </IconButton>
          ) : null}
        </div>
      </div>
    </>
  );
};
