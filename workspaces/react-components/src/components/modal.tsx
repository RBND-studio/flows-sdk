import { type FC } from "react";
import { type ComponentProps, type ModalProps as LibraryModalProps } from "@flows/shared";
import { Button } from "../internal-components/button";
import { BaseModal } from "../internal-components/base-modal";

export type ModalProps = ComponentProps<LibraryModalProps>;

export const Modal: FC<ModalProps> = (props) => {
  const buttons = [];
  if (props.continueText)
    buttons.push(
      <Button key="continue" variant="primary" onClick={props.continue}>
        {props.continueText}
      </Button>,
    );

  return (
    <BaseModal
      title={props.title}
      body={props.body}
      buttons={buttons.length ? buttons : undefined}
      overlay={!props.hideOverlay}
      onClose={props.showCloseButton ? props.close : undefined}
    />
  );
};
