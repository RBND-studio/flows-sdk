import { html, type TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import classNames from "classnames";
import { Close16 } from "../icons/close-16";
import { Text } from "./text";
import { IconButton } from "./icon-button";

interface Props {
  title: string;
  body: string;
  overlay: boolean;
  buttons: unknown[];
  close?: () => void;
}

export const BaseModal = (props: Props): TemplateResult => {
  const overlay = props.overlay
    ? html`<div
        class=${classNames("flows_modal_overlay", props.close && "flows_modal_clickable")}
        @click=${props.close}
        aria-hidden="true"
      ></div>`
    : null;

  return html`
    ${overlay}
    <div class="flows_modal_wrapper">
      <div class="flows_modal_modal">
        ${Text({ variant: "title", children: props.title })}
        ${Text({ variant: "body", children: unsafeHTML(props.body) })}
        ${props.buttons.length
          ? html`<div class="flows_modal_footer">${props.buttons.map((button) => button)}</div>`
          : null}
        ${props.close
          ? IconButton({
              children: Close16(),
              "aria-label": "Close",
              className: "flows_modal_close",
              onClick: props.close,
            })
          : null}
      </div>
    </div>
  `;
};
