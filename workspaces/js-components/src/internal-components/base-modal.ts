import { html, type TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import classNames from "classnames";
import { type Action, type ModalPosition, type ModalSize } from "@flows/shared";
import { Close16 } from "../icons/close-16";
import { Text } from "./text";
import { IconButton } from "./icon-button";
import { ActionButton } from "./action-button";

interface Props {
  title: string;
  body: string;
  overlay: boolean;
  position?: ModalPosition;
  size?: ModalSize;
  dots?: TemplateResult;

  primaryButton?: Action;
  secondaryButton?: Action;
  close?: () => void;
}

export const BaseModal = (props: Props): TemplateResult => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- value can be empty string ""
  const position: ModalPosition = props.position || "center";
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- value can be empty string ""
  const size: ModalSize = props.size || "small";

  const overlay = props.overlay
    ? html`<div
        class=${classNames("flows_modal_overlay", props.close && "flows_modal_clickable")}
        @click=${props.close}
        aria-hidden="true"
      ></div>`
    : null;

  const buttons = [];
  if (props.secondaryButton)
    buttons.push(ActionButton({ action: props.secondaryButton, variant: "secondary" }));
  if (props.primaryButton)
    buttons.push(ActionButton({ action: props.primaryButton, variant: "primary" }));

  return html`
    ${overlay}
    <div class="flows_modal_wrapper">
      <div
        class=${classNames(
          "flows_modal_modal",
          `flows_modal_${position}`,
          `flows_modal_width_${size}`,
        )}
      >
        ${Text({ variant: "title", children: props.title })}
        ${Text({ variant: "body", children: unsafeHTML(props.body) })}${props.dots}
        ${buttons.length ? html`<div class=${"flows_modal_footer"}>${buttons}</div>` : null}
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
