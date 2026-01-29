import { type StateMemory, type Action } from "./components";

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
export type ModalSize = "small" | "medium" | "auto";

export type ChecklistPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";

export type ButtonVariant = "primary" | "secondary" | "text";
export type ButtonSize = "default" | "small";

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
  hideProgress: boolean;
}

// Modal

export interface ModalProps {
  title: string;
  body: string;
  primaryButton?: Action;
  secondaryButton?: Action;

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

  dismissible: boolean;
  hideOverlay: boolean;
  position?: ModalPosition;
  size?: ModalSize;
  hideProgress: boolean;
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
  hideProgress: boolean;
}

// Card

export interface CardProps {
  title: string;
  body: string;
  primaryButton?: Action;
  secondaryButton?: Action;

  dismissible: boolean;
  width?: string;

  continue: () => void;
  close: () => void;
}

export interface TourCardProps {
  title: string;
  body: string;
  primaryButton?: Action;
  secondaryButton?: Action;

  dismissible: boolean;
  width?: string;
  hideProgress: boolean;
}

// Checklist

export interface ChecklistItem {
  title: string;
  description: string;
  primaryButton?: Action;
  secondaryButton?: Action;
  completed: StateMemory;
}

export interface FloatingChecklistProps {
  widgetTitle: string;

  popupTitle: string;
  popupDescription: string;

  completedTitle: string;
  completedDescription: string;
  completedButton?: Action;

  items: ChecklistItem[];

  position?: ChecklistPosition;
  defaultOpen: boolean;
  hideOnClick: boolean;
  openOnItemCompleted: boolean;
  skipButton?: Action;

  complete: () => void;
  close: () => void;
}
