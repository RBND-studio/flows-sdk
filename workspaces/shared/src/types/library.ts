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

export type ButtonVariant = "primary" | "secondary";

interface ButtonAction {
  action: Action;
  variant: ButtonVariant;
}

export interface TooltipProps {
  title: string;
  body: string;
  targetElement: string;
  showCloseButton: boolean;
  placement?: Placement;
  hideOverlay?: boolean;
  buttons: ButtonAction[];

  continue: () => void;
  close: () => void;
}

export interface TourTooltipProps {
  title: string;
  body: string;
  showCloseButton: boolean;
  targetElement: string;
  placement?: Placement;
  hideOverlay?: boolean;

  buttons: ButtonAction[];
}
