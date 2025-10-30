import { type FC } from "react";
import { type TourModalProps, type TourComponentProps } from "@flows/shared";
import { BaseModal } from "../internal-components/base-modal";
import { Button } from "../internal-components/button";

export type ModalProps = TourComponentProps<TourModalProps>;

export const Modal: FC<ModalProps> = (props) => {
  const buttons = [];
  if (props.previous && props.previousText)
    buttons.push(
      <Button key="previous" variant="secondary" onClick={props.previous}>
        {props.previousText}
      </Button>,
    );
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
      overlay={!props.hideOverlay}
      buttons={buttons.length ? buttons : undefined}
      onClose={props.showCloseButton ? props.cancel : undefined}
    />
  );
};
