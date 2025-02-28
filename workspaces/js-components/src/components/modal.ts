import { type ComponentProps } from "@flows/shared";
import { BaseModal } from "../internal-components/base-modal";
import { type Component } from "../types";

export type ModalProps = ComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  showCloseButton: boolean;
  hideOverlay: boolean;

  continue: () => void;
  close: () => void;
}>;

export const Modal: Component<ModalProps> = (props) => {
  const buttons: HTMLElement[] = [];

  let continueButton: HTMLButtonElement | null = null;
  if (props.continueText) {
    continueButton = document.createElement("button");
    buttons.push(continueButton);
    continueButton.className = "flows_button flows_button_primary";
    continueButton.textContent = props.continueText;
    continueButton.addEventListener("click", props.continue);
  }

  const result = BaseModal({
    title: props.title,
    body: props.body,
    overlay: !props.hideOverlay,
    buttons,
    close: props.showCloseButton ? props.close : undefined,
  });

  return {
    element: result.element,
    cleanup: () => {
      continueButton?.removeEventListener("click", props.continue);

      result.cleanup();
    },
  };
};
