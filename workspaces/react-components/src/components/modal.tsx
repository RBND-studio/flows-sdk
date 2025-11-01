import { type FC } from "react";
import { type ComponentProps, type ModalProps as LibraryModalProps } from "@flows/shared";
import { BaseModal } from "../internal-components/base-modal";

export type ModalProps = ComponentProps<LibraryModalProps>;

export const Modal: FC<ModalProps> = (props) => {
  return (
    <BaseModal
      title={props.title}
      body={props.body}
      primaryButton={props.primaryButton}
      secondaryButton={props.secondaryButton}
      overlay={!props.hideOverlay}
      onClose={props.dismissible ? props.close : undefined}
      position={props.position}
    />
  );
};
