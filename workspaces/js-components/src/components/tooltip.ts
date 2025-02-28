import { type ComponentProps, type Placement } from "@flows/shared";
import { type Component } from "../types";
import { BaseTooltip } from "../internal-components/base-tooltip";

export type TooltipProps = ComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  targetElement: string;
  showCloseButton: boolean;
  placement?: Placement;
  hideOverlay?: boolean;

  continue: () => void;
  close: () => void;
}>;

export const Tooltip: Component<TooltipProps> = (props) => {
  const buttons: HTMLElement[] = [];

  let continueButton: HTMLButtonElement | null = null;
  if (props.continueText) {
    continueButton = document.createElement("button");
    buttons.push(continueButton);
    continueButton.className = "flows_button flows_button_primary";
    continueButton.textContent = props.continueText;
    continueButton.addEventListener("click", props.continue);
  }

  const result = BaseTooltip({
    title: props.title,
    body: props.body,
    targetElement: props.targetElement,
    placement: props.placement,
    overlay: !props.hideOverlay,
    close: props.showCloseButton ? props.close : undefined,
    buttons,
  });

  return {
    element: result.element,
    cleanup: () => {
      result.cleanup();

      continueButton?.removeEventListener("click", props.continue);
    },
  };
};
