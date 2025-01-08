import { type FC } from "react";
import { type TourComponentProps } from "@flows/shared";
import { BaseModal } from "../internal-components/modal";
import { Button } from "../internal-components/button";

export type ModalProps = TourComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  previousText?: string;
  showCloseButton: boolean;
  hideOverlay: boolean;
}>;

export const Modal: FC<ModalProps> = (props) => {
  return (
    <BaseModal
      title={props.title}
      body={props.body}
      overlay={!props.hideOverlay}
      buttons={
        <>
          {props.previous && props.previousText ? (
            <Button variant="secondary" onClick={props.previous}>
              {props.previousText}
            </Button>
          ) : null}
          {props.continueText ? (
            <Button variant="primary" onClick={props.continue}>
              {props.continueText}
            </Button>
          ) : null}
        </>
      }
      onClose={props.showCloseButton ? props.cancel : undefined}
    />
  );
};
