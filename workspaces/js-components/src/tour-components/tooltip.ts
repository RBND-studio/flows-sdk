import { log, type FlowsProperties, type Placement, type TourComponentProps } from "@flows/shared";
import { LitElement, type TemplateResult, type PropertyValues, html } from "lit";
import { property, query, queryAll, state } from "lit/decorators.js";
import { autoUpdate } from "@floating-ui/dom";
import { BaseTooltip, updateTooltip } from "../internal-components/base-tooltip";
import { observeQuerySelector } from "../lib/query-selector";
import { Button } from "../internal-components/button";

export type TooltipProps = TourComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  previousText?: string;
  showCloseButton: boolean;
  targetElement: string;
  placement?: Placement;
  hideOverlay?: boolean;
}>;

export class Tooltip extends LitElement implements TooltipProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: String })
  continueText?: string;

  @property({ type: String })
  previousText?: string;

  @property({ type: String })
  targetElement: string;

  @property({ type: Boolean })
  showCloseButton: boolean;

  @property({ type: String })
  placement?: Placement;

  @property({ type: Boolean })
  hideOverlay: boolean;

  @property({ type: Function })
  continue: () => void;

  @property({ type: Function })
  previous?: () => void;

  @property({ type: Function })
  cancel: () => void;

  __flows: FlowsProperties;

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

  render(): unknown {
    const reference = this._reference;
    if (!reference) {
      log.error("Cannot render Tooltip without target element");
      return null;
    }

    let previousButton: TemplateResult | null = null;
    if (this.previous && this.previousText) {
      previousButton = Button({
        variant: "secondary",
        children: this.previousText,
        onClick: this.previous,
      });
    }

    let continueButton: TemplateResult | null = null;
    if (this.continueText) {
      continueButton = Button({
        variant: "primary",
        children: this.continueText,
        onClick: this.continue,
      });
    }

    const buttons =
      Boolean(continueButton) || Boolean(previousButton)
        ? [
            previousButton ?? html`<div aria-hidden="true"></div>`,
            continueButton ?? html`<div aria-hidden="true"></div>`,
          ]
        : [];

    return BaseTooltip({
      title: this.title,
      body: this.body,
      placement: this.placement,
      overlay: !this.hideOverlay,
      close: this.showCloseButton ? this.cancel : undefined,
      buttons,
    });
  }
}
