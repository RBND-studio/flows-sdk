import { close16 } from "../icons/close-16";
import { type Component } from "../types";

export interface ModalProps {
  title: string;
  body: string;
  continueText?: string;
  showCloseButton: boolean;
  hideOverlay: boolean;

  continue: () => void;
  close: () => void;
}

export const Modal: Component<ModalProps> = (props) => {
  const root = document.createElement("div");

  let overlay: HTMLDivElement | null = null;
  if (!props.hideOverlay) {
    overlay = document.createElement("div");
    root.appendChild(overlay);
    overlay.className = `flows_modal_overlay${
      props.showCloseButton ? " flows_modal_clickable" : ""
    }`;
    overlay.ariaHidden = "true";
    overlay.addEventListener("click", props.close);
  }

  const modalWrapper = document.createElement("div");
  root.appendChild(modalWrapper);
  modalWrapper.className = "flows_modal_wrapper";

  const modal = document.createElement("div");
  modalWrapper.appendChild(modal);
  modal.className = "flows_modal_modal";

  const title = document.createElement("p");
  modal.appendChild(title);
  title.className = "flows_text flows_text_title";
  title.textContent = props.title;

  const body = document.createElement("p");
  modal.appendChild(body);
  body.className = "flows_text flows_text_body";
  body.textContent = props.body;

  const footer = document.createElement("div");
  modal.appendChild(footer);
  footer.className = "flows_modal_footer";

  let continueButton: HTMLButtonElement | null = null;
  if (props.continueText) {
    continueButton = document.createElement("button");
    footer.appendChild(continueButton);
    continueButton.className = "flows_button flows_button_primary";
    continueButton.textContent = props.continueText;
    continueButton.addEventListener("click", props.continue);
  }

  let closeButton: HTMLButtonElement | null = null;
  if (props.showCloseButton) {
    closeButton = document.createElement("button");
    modal.appendChild(closeButton);
    closeButton.className = "flows_iconButton flows_modal_close";
    closeButton.addEventListener("click", props.close);
    closeButton.appendChild(close16());
  }

  return {
    element: root,
    cleanup: () => {
      continueButton?.removeEventListener("click", props.continue);
      closeButton?.removeEventListener("click", props.close);
      overlay?.removeEventListener("click", props.close);
    },
  };
};
