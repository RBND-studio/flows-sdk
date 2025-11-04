import { type Action } from "./components";

export type Placement =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-start"
  | "top-end"
  | "right-start"
  | "right-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end";

export type ModalPosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
export type ModalButtonAlignment = "left" | "center" | "right";
export type ModalSize = "small" | "medium" | "auto";

export type ButtonVariant = "primary" | "secondary";

// Tooltip
export interface TooltipProps {
  title: string;
  body: string;
  primaryButton?: Action;
  secondaryButton?: Action;

  targetElement: string;
  placement?: Placement;
  dismissible: boolean;
  hideOverlay: boolean;

  continue: () => void;
  close: () => void;
}

export interface TourTooltipProps {
  title: string;
  body: string;
  primaryButton?: Action;
  secondaryButton?: Action;

  targetElement: string;
  placement?: Placement;
  dismissible: boolean;
  hideOverlay: boolean;
  showProgress: boolean;
}

// Modal

export interface ModalProps {
  title: string;
  body: string;
  primaryButton?: Action;
  secondaryButton?: Action;
  buttonAlignment?: ModalButtonAlignment;

  dismissible: boolean;
  hideOverlay: boolean;
  position?: ModalPosition;
  size?: ModalSize;

  continue: () => void;
  close: () => void;
}

export interface TourModalProps {
  title: string;
  body: string;
  primaryButton?: Action;
  secondaryButton?: Action;
  buttonAlignment?: ModalButtonAlignment;

  dismissible: boolean;
  hideOverlay: boolean;
  position?: ModalPosition;
  size?: ModalSize;
  showProgress: boolean;
}

// Hint

export interface HintProps {
  title: string;
  body: string;
  primaryButton?: Action;
  secondaryButton?: Action;

  targetElement: string;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;
  dismissible: boolean;

  continue: () => void;
  close: () => void;
}

export interface TourHintProps {
  title: string;
  body: string;
  primaryButton?: Action;
  secondaryButton?: Action;

  targetElement: string;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;
  dismissible: boolean;
  showProgress: boolean;
}
