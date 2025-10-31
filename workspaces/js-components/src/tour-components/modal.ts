import {
  type TourComponentProps,
  type FlowsProperties,
  type TourModalProps,
  type Action,
  type ModalPosition,
} from "@flows/shared";
import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import { BaseModal } from "../internal-components/base-modal";

export type ModalProps = TourComponentProps<TourModalProps>;

export class Modal extends LitElement implements ModalProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: Object })
  primaryButton?: Action;

  @property({ type: Object })
  secondaryButton?: Action;

  @property({ type: Boolean })
  dismissible: boolean;

  @property({ type: Boolean })
  hideOverlay: boolean;

  @property({ type: String })
  position?: ModalPosition;

  @property({ type: Function })
  continue: () => void;

  @property({ type: Function })
  previous?: () => void;

  @property({ type: Function })
  cancel: () => void;

  __flows: FlowsProperties;

  createRenderRoot(): this {
    return this;
  }

  render(): unknown {
    return BaseModal({
      title: this.title,
      body: this.body,
      primaryButton: this.primaryButton,
      secondaryButton: this.secondaryButton,
      overlay: !this.hideOverlay,
      position: this.position,
      close: this.dismissible ? this.cancel : undefined,
    });
  }
}
