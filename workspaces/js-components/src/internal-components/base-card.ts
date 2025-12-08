import { type Action } from "@flows/shared";
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

  dots?: TemplateResult;
  primaryButton?: Action;
  secondaryButton?: Action;
  width?: string;
  tour: boolean;

  onClose?: () => void;
}

export const BaseCard = (props: Props): TemplateResult => {
  const buttons = [];
  if (props.primaryButton)
    buttons.push(ActionButton({ action: props.primaryButton, variant: "primary" }));
  if (props.secondaryButton)
    buttons.push(ActionButton({ action: props.secondaryButton, variant: "secondary" }));

  if (props.tour) buttons.reverse();

  const cardWidth = (() => {
    if (Number(props.width) === 0) return undefined;
    if (Number.isNaN(Number(props.width))) return props.width;
    return `${props.width}px`;
  })();

  return html`
    <div class="flows_basicsV2_card" style="width: 100%; max-width: ${cardWidth}">
      ${Text({ variant: "title", className: "flows_basicsV2_card_title", children: props.title })}
      ${Text({ variant: "body", children: unsafeHTML(DOMPurify.sanitize(props.body)) })}
      ${!props.tour && buttons.length
        ? html`<div class="flows_basicsV2_card_footer">
            <div class="flows_basicsV2_card_buttons">${buttons}</div>
          </div>`
        : null}
      ${props.tour && (props.dots ?? buttons.length)
        ? html`<div className="flows_basicsV2_card_footer">
            ${props.dots}
            ${buttons.length
              ? html`<div className="flows_basicsV2_card_buttons_wrapper">
                  <div className="flows_basicsV2_card_buttons">${buttons}</div>
                </div>`
              : null}
          </div>`
        : null}
      ${props.onClose
        ? IconButton({
            children: Close16(),
            "aria-label": "Close",
            className: "flows_basicsV2_card_close",
            onClick: props.onClose,
          })
        : null}
    </div>
  `;
};
