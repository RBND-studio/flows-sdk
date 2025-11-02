import { type FC } from "react";
import { type TourModalProps, type TourComponentProps } from "@flows/shared";
import { BaseModal } from "../internal-components/base-modal";
import { Dots } from "../internal-components/dots";

export type ModalProps = TourComponentProps<TourModalProps>;

export const Modal: FC<ModalProps> = (props) => {
  return (
    <BaseModal
      title={props.title}
      body={props.body}
      overlay={!props.hideOverlay}
      primaryButton={props.primaryButton}
      secondaryButton={props.secondaryButton}
      onClose={props.dismissible ? props.cancel : undefined}
      position={props.position}
      dots={
        <Dots
          count={props.__flows.tourVisibleStepCount ?? 0}
          index={props.__flows.tourVisibleStepIndex ?? 0}
        />
      }
    />
  );
};
