import { type FC } from "react";
import { Button } from "../internal-components/button";
import { BaseModal } from "../internal-components/base-modal";

export interface ModalProps {
  title: string;
  body: string;
  continueText?: string;
  showCloseButton: boolean;
  hideOverlay: boolean;

  continue: () => void;
  close: () => void;
}

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
