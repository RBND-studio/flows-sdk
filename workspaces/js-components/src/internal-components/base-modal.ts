import { close16 } from "../icons/close-16";
import { type Component } from "../types";

interface Props {
  title: string;
  body: string;
  overlay: boolean;
  buttons: HTMLElement[];
  close?: () => void;
}

export const BaseModal: Component<Props> = (props) => {
  const root = document.createElement("div");

  let overlay: HTMLDivElement | null = null;
  if (props.overlay) {
    overlay = document.createElement("div");
    root.appendChild(overlay);
    overlay.className = `flows_modal_overlay${props.close ? " flows_modal_clickable" : ""}`;
    overlay.ariaHidden = "true";
    if (props.close) overlay.addEventListener("click", props.close);
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
  body.innerHTML = props.body;

  const footer = document.createElement("div");
  modal.appendChild(footer);
  footer.className = "flows_modal_footer";

  props.buttons.forEach((button) => footer.appendChild(button));

  let closeButton: HTMLButtonElement | null = null;
  if (props.close) {
    closeButton = document.createElement("button");
    modal.appendChild(closeButton);
    closeButton.className = "flows_iconButton flows_modal_close";
    closeButton.ariaLabel = "Close";
    closeButton.addEventListener("click", props.close);
    closeButton.appendChild(close16());
  }

  return {
    element: root,
    cleanup: () => {
      if (props.close) {
        closeButton?.removeEventListener("click", props.close);
        overlay?.removeEventListener("click", props.close);
      }
    },
  };
};
