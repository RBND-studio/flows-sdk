import {
  type CardProps as LibraryCardProps,
  type ComponentProps,
  type Action,
  type FlowsProperties,
} from "@flows/shared";
import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import { BaseCard } from "../internal-components/base-card";

export type CardProps = ComponentProps<LibraryCardProps>;

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

  @property({ type: Function })
  close: () => void;

  __flows: FlowsProperties;

  createRenderRoot(): this {
    return this;
  }

  render(): unknown {
    return BaseCard({
      title: this.title,
      body: this.body,
      primaryButton: this.primaryButton,
      secondaryButton: this.secondaryButton,
      onClose: this.dismissible ? this.close : undefined,
      width: this.width,
      tour: false,
    });
  }
}

export const BasicsV2Card = Card;
