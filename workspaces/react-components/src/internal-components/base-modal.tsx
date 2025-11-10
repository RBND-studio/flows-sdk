import { type ReactNode, type FC } from "react";
import classNames from "classnames";
import { type Action, type ModalPosition, type ModalSize } from "@flows/shared";
import { Close16 } from "../icons/close16";
import { Text } from "./text";
import { IconButton } from "./icon-button";
import { ActionButton } from "./action-button";

interface Props {
  title: string;
  body: string;
  overlay: boolean;
  position?: ModalPosition;
  size?: ModalSize;
  dots?: ReactNode;

  primaryButton?: Action;
  secondaryButton?: Action;
  onClose?: () => void;
}

export const BaseModal: FC<Props> = (props) => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- value can be empty string ""
  const position: ModalPosition = props.position || "center";
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- value can be empty string ""
  const size: ModalSize = props.size || "small";

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
        <div className="flows_basicsV2_modal_overlay" onClick={props.onClose} aria-hidden="true" />
      ) : null}

      <div className="flows_basicsV2_modal_wrapper">
        <div
          className={classNames(
            "flows_basicsV2_modal_modal",
            `flows_basicsV2_modal_${position}`,
            `flows_basicsV2_modal_width_${size}`,
          )}
        >
          <Text className="flows_basicsV2_modal_title" variant="title">
            {props.title}
          </Text>
          <Text
            className="flows_basicsV2_modal_body"
            variant="body"
            dangerouslySetInnerHTML={{ __html: props.body }}
          />

          {props.dots ? <div className="flows_basicsV2_modal_dots">{props.dots}</div> : null}

          {buttons.length ? <div className="flows_basicsV2_modal_footer">{buttons}</div> : null}
          {props.onClose ? (
            <IconButton
              aria-label="Close"
              className="flows_basicsV2_modal_close"
              onClick={props.onClose}
            >
              <Close16 />
            </IconButton>
          ) : null}
        </div>
      </div>
    </>
  );
};
