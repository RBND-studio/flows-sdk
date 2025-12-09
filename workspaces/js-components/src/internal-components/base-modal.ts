import { type Action, type ModalPosition, type ModalSize } from "@flows/shared";
import { clsx } from "clsx";
// eslint-disable-next-line import/no-named-as-default -- correct import
import DOMPurify from "dompurify";
import { html, type TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Close16 } from "../icons/close-16";
import { ActionButton } from "./action-button";
import { IconButton } from "./icon-button";
import { Text } from "./text";

interface Props {
  title: string;
  body: string;
  overlay: boolean;
  position?: ModalPosition;
  size?: ModalSize;

  dots?: TemplateResult;
  primaryButton?: Action;
  secondaryButton?: Action;
  onClose?: () => void;
}

export const BaseModal = (props: Props): TemplateResult => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- value can be empty string ""
  const position: ModalPosition = props.position || "center";
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- value can be empty string ""
  const size: ModalSize = props.size || "small";

  const overlay = props.overlay
    ? html`<div
        class="flows_basicsV2_modal_overlay"
        @click=${props.onClose}
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
    <div class="flows_basicsV2_modal_wrapper">
      <div
        class=${clsx(
          "flows_basicsV2_modal_modal",
          `flows_basicsV2_modal_${position}`,
          `flows_basicsV2_modal_width_${size}`,
        )}
      >
        ${Text({
          variant: "title",
          className: "flows_basicsV2_modal_title",
          children: props.title,
        })}
        ${Text({
          variant: "body",
          className: "flows_basicsV2_modal_body",
          children: unsafeHTML(
            DOMPurify.sanitize(props.body, {
              FORCE_BODY: true,
              ADD_ATTR: ["target"],
            }),
          ),
        })}
        ${props.dots ? html`<div class="flows_basicsV2_modal_dots">${props.dots}</div>` : null}
        ${buttons.length
          ? html`<div class=${"flows_basicsV2_modal_footer"}>${buttons}</div>`
          : null}
        ${props.onClose
          ? IconButton({
              children: Close16(),
              "aria-label": "Close",
              className: "flows_basicsV2_modal_close",
              onClick: props.onClose,
            })
          : null}
      </div>
    </div>
  `;
};
