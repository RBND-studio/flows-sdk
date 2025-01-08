import { type FC, type ReactNode } from "react";
import classNames from "classnames";
import { Text } from "../text/text";
import { IconButton } from "../icon-button";
import { Close16 } from "../../icons/close16";

interface Props {
  title: string;
  body: string;
  overlay: boolean;
  buttons: ReactNode;
  onClose?: () => void;
}

export const BaseModal: FC<Props> = (props) => {
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
        <div className="flows_modal_modal">
          <Text variant="title">{props.title}</Text>
          <Text variant="body" dangerouslySetInnerHTML={{ __html: props.body }} />

          <div className="flows_modal_footer">{props.buttons}</div>
          {props.onClose ? (
            <IconButton className="flows_modal_close" onClick={props.onClose}>
              <Close16 />
            </IconButton>
          ) : null}
        </div>
      </div>
    </>
  );
};
