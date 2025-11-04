import {
  type ModalPosition,
  type Action,
  type ComponentProps,
  type FlowsProperties,
  type ModalProps as LibraryModalProps,
  type ModalSize,
} from "@flows/shared";
import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import { BaseModal } from "../internal-components/base-modal";

export type ModalProps = ComponentProps<LibraryModalProps>;

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

  @property({ type: String })
  size?: ModalSize;

  @property({ type: Function })
  continue: () => void;

  @property({ type: Function })
  close: () => void;

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
      size: this.size,
      close: this.dismissible ? this.close : undefined,
    });
  }
}
