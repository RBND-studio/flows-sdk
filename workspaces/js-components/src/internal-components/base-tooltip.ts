import { log, type Placement } from "@flows/shared";
import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Side,
} from "@floating-ui/dom";
import { html, LitElement, type PropertyValues, type TemplateResult } from "lit";
import classNames from "classnames";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { property, query, queryAll, state } from "lit/decorators.js";
import { Close16 } from "../icons/close-16";
import { observeQuerySelector } from "../lib/query-selector";
import { Text } from "./text";
import { IconButton } from "./icon-button";

class BaseTooltip extends LitElement {
  @property()
  title: string;
  @property()
  body: string;
  @property({ attribute: false })
  buttons: unknown[];
  @property({ attribute: false })
  close?: () => void;
  @property()
  targetElement: string;
  @property()
  placement?: Placement;
  @property({ type: Boolean })
  overlay?: boolean;
  @property({ attribute: false })
  dots?: unknown;

  @query(".flows_tooltip_tooltip")
  tooltip: HTMLElement;

  @queryAll(".flows_tooltip_arrow")
  arrows: [HTMLElement, HTMLElement];

  @state()
  private _reference: Element | null = null;

  autoUpdateCleanup: (() => void) | null = null;
  observerCleanup: (() => void) | null = null;

  connectedCallback(): void {
    super.connectedCallback();

    this.observerCleanup = observeQuerySelector(this.targetElement, (el) => {
      this._reference = el;
    });
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.autoUpdateCleanup?.();
    this.observerCleanup?.();
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    if (!this.targetElement) {
      log.error("Cannot render Tooltip without target element");
    }

    const reference = this._reference;
    if (!reference) return;

    const tooltip = this.tooltip;

    this.autoUpdateCleanup = autoUpdate(
      reference,
      tooltip,
      () =>
        void updateTooltip({
          reference,
          tooltip,
          arrowEls: this.arrows,
          overlay: null,
          placement: this.placement,
        }),
      { animationFrame: true },
    );
  }

  createRenderRoot(): this {
    return this;
  }

  render(): TemplateResult | null {
    const reference = this._reference;
    if (!reference) {
      log.error("Cannot render Tooltip without target element");
      return null;
    }

    return html`
      <div class="flows_tooltip_root">
        ${this.overlay ? html`<div class="flows_tooltip_overlay"></div>` : null}
        <div class="flows_tooltip_tooltip">
          ${Text({ variant: "title", className: "flows_tooltip_title", children: this.title })}
          ${Text({
            variant: "body",
            className: "flows_tooltip_body",
            children: unsafeHTML(this.body),
          })}
          ${this.dots || Boolean(this.buttons.length)
            ? html` <div class="flows_tooltip_footer">
                ${this.dots}
                ${this.buttons.length
                  ? html`<div className="flows_tooltip_buttons_wrapper">
                      <div className="flows_tooltip_buttons">${this.buttons}</div>
                    </div>`
                  : null}
              </div>`
            : null}
          ${this.close
            ? IconButton({
                "aria-label": "Close",
                className: "flows_tooltip_close",
                children: Close16(),
                onClick: this.close,
              })
            : null}

          <div class=${classNames("flows_tooltip_arrow", "flows_tooltip_arrow-bottom")}></div>
          <div class=${classNames("flows_tooltip_arrow", "flows_tooltip_arrow-top")}></div>
        </div>
      </div>
    `;
  }
}
export const defineBaseTooltip = (): void => {
  if (!customElements.get("flows-base-tooltip"))
    customElements.define("flows-base-tooltip", BaseTooltip);
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
