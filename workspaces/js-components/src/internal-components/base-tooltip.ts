import { type Placement } from "@flows/shared";
import { arrow, computePosition, flip, offset, shift, type Side } from "@floating-ui/dom";
import { html, type TemplateResult } from "lit";
import classNames from "classnames";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Close16 } from "../icons/close-16";
import { Text } from "./text";
import { IconButton } from "./icon-button";

interface Props {
  title: string;
  body: string;
  buttons?: TemplateResult[];
  close?: () => void;
  placement?: Placement;
  overlay?: boolean;
}

export const BaseTooltip = (props: Props): TemplateResult => {
  return html`
    <div class="flows_tooltip_root">
      ${props.overlay ? html`<div class="flows_tooltip_overlay"></div>` : null}
      <div class="flows_tooltip_tooltip">
        ${Text({ variant: "title", className: "flows_tooltip_title", children: props.title })}
        ${Text({
          variant: "body",
          className: "flows_tooltip_body",
          children: unsafeHTML(props.body),
        })}
        ${props.buttons?.length
          ? html`<div class="flows_tooltip_footer">${props.buttons}</div>`
          : null}
        ${props.close
          ? IconButton({
              "aria-label": "Close",
              className: "flows_tooltip_close",
              children: Close16(),
              onClick: props.close,
            })
          : null}

        <div class=${classNames("flows_tooltip_arrow", "flows_tooltip_arrow-bottom")}></div>
        <div class=${classNames("flows_tooltip_arrow", "flows_tooltip_arrow-top")}></div>
      </div>
    </div>
  `;
};

const DISTANCE = 4;
const ARROW_SIZE = 6;
const OFFSET_DISTANCE = DISTANCE + ARROW_SIZE;
const BOUNDARY_PADDING = 8;
const ARROW_EDGE_PADDING = 8;

export const updateTooltip = ({
  reference,
  tooltip,
  placement,
  arrowEls,
  overlay,
}: {
  reference: Element;
  tooltip: HTMLElement;
  placement?: Placement;
  arrowEls: [HTMLElement, HTMLElement];
  overlay: HTMLElement | null;
}): Promise<void> => {
  if (overlay) {
    const targetPosition = reference.getBoundingClientRect();
    overlay.style.top = `${targetPosition.top}px`;
    overlay.style.left = `${targetPosition.left}px`;
    overlay.style.width = `${targetPosition.width}px`;
    overlay.style.height = `${targetPosition.height}px`;
  }

  return computePosition(reference, tooltip, {
    placement,
    middleware: [
      flip({ fallbackPlacements: ["top", "bottom", "left", "right"] }),
      shift({ crossAxis: true, padding: BOUNDARY_PADDING }),
      arrow({ element: arrowEls[0], padding: ARROW_EDGE_PADDING }),
      offset(OFFSET_DISTANCE),
    ],
  }).then(({ x, y, middlewareData, placement: finalPlacement }) => {
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;

    if (middlewareData.arrow) {
      const staticSide = ((): Side => {
        if (finalPlacement.includes("top")) return "bottom";
        if (finalPlacement.includes("bottom")) return "top";
        if (finalPlacement.includes("left")) return "right";
        return "left";
      })();
      const arrowX = middlewareData.arrow.x;
      const arrowY = middlewareData.arrow.y;

      arrowEls.forEach((arrowEl) => {
        // eslint-disable-next-line eqeqeq -- null check is intended here
        arrowEl.style.left = arrowX != null ? `${arrowX}px` : "";
        // eslint-disable-next-line eqeqeq -- null check is intended here
        arrowEl.style.top = arrowY != null ? `${arrowY}px` : "";
        arrowEl.style.right = "";
        arrowEl.style.bottom = "";
        arrowEl.style[staticSide] = `${-ARROW_SIZE}px`;
      });
    }
  });
};
