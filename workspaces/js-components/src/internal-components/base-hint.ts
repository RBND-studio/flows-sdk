import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
import { type Action, log, type Placement } from "@flows/shared";
import { html, LitElement, type PropertyValues, type TemplateResult } from "lit";
import { property, query, queryAll, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
// eslint-disable-next-line import/no-named-as-default -- correct import
import DOMPurify from "dompurify";
import { Close16 } from "../icons/close-16";
import { observeQuerySelector } from "../lib/query-selector";
import { ActionButton } from "./action-button";
import { IconButton } from "./icon-button";
import { Text } from "./text";

const CLOSE_TIMEOUT = 300;
const BOUNDARY_PADDING = 8;
const DISTANCE = 4;

class BaseHint extends LitElement {
  @property()
  title: string;
  @property()
  body: string;

  @property()
  targetElement: string;
  @property()
  placement?: Placement;
  @property({ type: Number })
  offsetX?: number;
  @property({ type: Number })
  offsetY?: number;

  @property({ attribute: false })
  dots?: unknown;
  @property({ attribute: false })
  primaryButton?: Action;
  @property({ attribute: false })
  secondaryButton?: Action;
  @property({ attribute: false })
  onClose?: () => void;

  @state()
  private accessor _open = false;

  @state()
  private accessor _tooltipClosing = false;

  private _closeTimeout: number | null = null;
  handleClick(): void {
    if (!this._open || this._tooltipClosing) {
      this._open = true;
      this._tooltipClosing = false;
      window.clearTimeout(this._closeTimeout ?? undefined);
      this._closeTimeout = null;
    } else {
      this._tooltipClosing = true;
      this._closeTimeout = window.setTimeout(() => {
        this._open = false;
        this._tooltipClosing = false;
        this._closeTimeout = null;
      }, CLOSE_TIMEOUT);
    }
  }

  @query(".flows_basicsV2_hint_hotspot")
  target: HTMLElement;

  @query(".flows_basicsV2_tooltip_tooltip")
  tooltip?: HTMLElement;

  @queryAll(".flows_basicsV2_tooltip_arrow")
  arrows: [HTMLElement, HTMLElement];

  @state()
  private _reference: Element | null = null;

  targetAutoUpdateCleanup: (() => void) | null = null;
  tooltipAutoUpdateCleanup: (() => void) | null = null;
  observerCleanup: (() => void) | null = null;

  connectedCallback(): void {
    super.connectedCallback();

    this.observerCleanup = observeQuerySelector(this.targetElement, (el) => {
      this._reference = el;
    });
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.targetAutoUpdateCleanup?.();
    this.tooltipAutoUpdateCleanup?.();
    this.observerCleanup?.();
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    if (!this.targetElement) {
      log.error("Cannot render Hint without target element");
    }

    const reference = this._reference;
    if (!reference) return;

    this.targetAutoUpdateCleanup = autoUpdate(
      reference,
      this.target,
      () =>
        void updateTargetButton({
          reference,
          el: this.target,
          offsetX: this.offsetX,
          offsetY: this.offsetY,
        }),
      { animationFrame: true },
    );
  }

  protected updated(_changedProperties: PropertyValues): void {
    const reference = this.target;
    const tooltip = this.tooltip;
    if (!tooltip) return;

    this.tooltipAutoUpdateCleanup = autoUpdate(
      reference,
      tooltip,
      () =>
        void updateTooltip({
          reference,
          el: tooltip,
          placement: this.placement,
        }),
      { animationFrame: true },
    );
  }

  createRenderRoot(): this {
    return this;
  }

  render(): TemplateResult | null {
    if (!this._reference) return null;

    const buttons = [];
    if (this.secondaryButton)
      buttons.push(ActionButton({ action: this.secondaryButton, variant: "secondary" }));
    if (this.primaryButton)
      buttons.push(ActionButton({ action: this.primaryButton, variant: "primary" }));

    return html`
      <button
        aria-label="Open hint"
        type="button"
        class="flows_basicsV2_hint_hotspot"
        @click=${this.handleClick.bind(this)}
      ></button>

      ${this._open
        ? html`
            <div
              data-open=${!this._tooltipClosing ? "true" : "false"}
              class="flows_basicsV2_tooltip_tooltip flows_basicsV2_hint_tooltip"
            >
              ${Text({
                className: "flows_basicsV2_tooltip_title",
                variant: "title",
                children: this.title,
              })}
              ${Text({
                className: "flows_basicsV2_tooltip_body",
                variant: "body",
                children: unsafeHTML(DOMPurify.sanitize(this.body)),
              })}
              ${this.dots || Boolean(buttons.length)
                ? html` <div class="flows_basicsV2_tooltip_footer">
                    ${this.dots}
                    ${buttons.length
                      ? html`<div className="flows_basicsV2_tooltip_buttons_wrapper">
                          <div className="flows_basicsV2_tooltip_buttons">${buttons}</div>
                        </div>`
                      : null}
                  </div>`
                : null}
              ${this.onClose
                ? IconButton({
                    children: Close16(),
                    className: "flows_basicsV2_tooltip_close",
                    "aria-label": "Close",
                    onClick: this.onClose,
                  })
                : null}
            </div>
          `
        : null}
    `;
  }
}
export const defineBaseHint = (): void => {
  if (!customElements.get("flows-base-hint")) customElements.define("flows-base-hint", BaseHint);
};

export const updateTargetButton = ({
  reference,
  el,
  placement,
  offsetX,
  offsetY,
}: {
  reference: Element;
  el: HTMLElement;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;
}): Promise<void> => {
  return computePosition(reference, el, {
    placement,
  }).then(({ x, y }) => {
    el.style.left = `${x + (offsetX ?? 0)}px`;
    el.style.top = `${y + (offsetY ?? 0)}px`;
  });
};

export const updateTooltip = ({
  el,
  reference,
  placement,
}: {
  reference: Element;
  el: HTMLElement;
  placement?: Placement;
}): Promise<void> => {
  return computePosition(reference, el, {
    placement,
    middleware: [
      flip({ fallbackPlacements: ["top", "bottom", "left", "right"] }),
      shift({ crossAxis: true, padding: BOUNDARY_PADDING }),
      offset(DISTANCE),
    ],
  }).then(({ x, y }) => {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  });
};
