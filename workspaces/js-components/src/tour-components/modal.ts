import { type TourComponentProps } from "@flows/shared";
import { type Component } from "../types";
import { BaseModal } from "../internal-components/base-modal";

export type ModalProps = TourComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  previousText?: string;
  showCloseButton: boolean;
  hideOverlay: boolean;
}>;

export const Modal: Component<ModalProps> = (props) => {
  const buttons: HTMLElement[] = [];

  let previousButton: HTMLButtonElement | null = null;
  if (props.previous && props.previousText) {
    previousButton = document.createElement("button");
    buttons.push(previousButton);
    previousButton.className = "flows_button flows_button_secondary";
    previousButton.textContent = props.previousText;
    previousButton.addEventListener("click", props.previous);
  }

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
    close: props.showCloseButton ? props.cancel : undefined,
  });

  return {
    element: result.element,
    cleanup: () => {
      if (props.previous) previousButton?.removeEventListener("click", props.previous);
      continueButton?.removeEventListener("click", props.continue);

      result.cleanup();
    },
  };
};
