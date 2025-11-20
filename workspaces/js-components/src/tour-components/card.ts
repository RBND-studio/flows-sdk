import {
  type Action,
  type FlowsProperties,
  type TourCardProps,
  type TourComponentProps,
} from "@flows/shared";
import { property } from "lit/decorators.js";
import { LitElement } from "lit";
import { Dots } from "../internal-components/dots";
import { BaseCard } from "../internal-components/base-card";

export type CardProps = TourComponentProps<TourCardProps>;

class Card extends LitElement implements CardProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: Object })
  primaryButton?: Action;

  @property({ type: Object })
  secondaryButton?: Action;

  @property({ type: Boolean })
  dismissible: boolean;

  @property({ type: String })
  width?: string;

  @property({ type: Boolean })
  hideProgress: boolean;

  @property({ type: Function })
  continue: () => void;

  @property({ type: Function })
  previous?: () => void;

  @property({ type: Function })
  cancel: () => void;

  __flows: FlowsProperties;

  createRenderRoot(): this {
    return this;
  }

  render(): unknown {
    const dots = !this.hideProgress
      ? Dots({
          count: this.__flows.tourVisibleStepCount ?? 0,
          index: this.__flows.tourVisibleStepIndex ?? 0,
        })
      : undefined;

    return BaseCard({
      title: this.title,
      body: this.body,
      primaryButton: this.primaryButton,
      secondaryButton: this.secondaryButton,
      width: this.width,
      onClose: this.dismissible ? this.cancel : undefined,
      dots,
      tour: true,
    });
  }
}

export const BasicsV2Card = Card;
