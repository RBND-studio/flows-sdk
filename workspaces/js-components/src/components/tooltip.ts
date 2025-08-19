import { type ComponentProps, type Placement, type FlowsProperties, log } from "@flows/shared";
import { LitElement, type PropertyValues, type TemplateResult } from "lit";
import { property, query, queryAll, state } from "lit/decorators.js";
import { autoUpdate } from "@floating-ui/dom";
import { BaseTooltip, updateTooltip } from "../internal-components/base-tooltip";
import { observeQuerySelector } from "../lib/query-selector";
import { Button } from "../internal-components/button";

export type TooltipProps = ComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  targetElement: string;
  showCloseButton: boolean;
  placement?: Placement;
  hideOverlay: boolean;

  continue: () => void;
  close: () => void;
}>;

export class Tooltip extends LitElement implements TooltipProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: String })
  continueText?: string;

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
  close: () => void;

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

    const buttons: TemplateResult[] = [];
    if (this.continueText) {
      buttons.push(
        Button({
          onClick: this.continue,
          variant: "primary",
          children: this.continueText,
        }),
      );
    }

    return BaseTooltip({
      title: this.title,
      body: this.body,
      placement: this.placement,
      overlay: !this.hideOverlay,
      close: this.showCloseButton ? this.close : undefined,
      buttons,
    });
  }
}
