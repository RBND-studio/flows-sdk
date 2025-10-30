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

export type ButtonVariant = "primary" | "secondary";

// Tooltip
export interface TooltipProps {
  title: string;
  body: string;
  continueText?: string;
  targetElement: string;
  showCloseButton: boolean;
  placement?: Placement;
  hideOverlay: boolean;

  continue: () => void;
  close: () => void;
}

export interface TourTooltipProps {
  title: string;
  body: string;
  continueText?: string;
  previousText?: string;
  showCloseButton: boolean;
  targetElement: string;
  placement?: Placement;
  hideOverlay?: boolean;
}

// Modal

export interface ModalProps {
  title: string;
  body: string;
  continueText?: string;
  showCloseButton: boolean;
  hideOverlay: boolean;

  continue: () => void;
  close: () => void;
}

export interface TourModalProps {
  title: string;
  body: string;
  continueText?: string;
  previousText?: string;
  showCloseButton: boolean;
  hideOverlay: boolean;
}

// Hint

export interface HintProps {
  title: string;
  body: string;
  continueText?: string;
  showCloseButton: boolean;

  targetElement: string;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;

  continue: () => void;
  close: () => void;
}

export interface TourHintProps {
  title: string;
  body: string;
  continueText?: string;
  previousText?: string;
  showCloseButton: boolean;

  targetElement: string;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;
}
