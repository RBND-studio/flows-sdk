import { type Placement, type TourComponentProps } from "@flows/shared";
import { BaseTooltip } from "../internal-components/base-tooltip";
import { type Component } from "../types";

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

export const Tooltip: Component<TooltipProps> = (props) => {
  const buttons: HTMLElement[] = [];

  let previousButton: HTMLButtonElement | null = null;
  if (props.previous && props.previousText) {
    previousButton = document.createElement("button");
    buttons.push(previousButton);
    previousButton.className = "flows_button flows_button_secondary";
    previousButton.textContent = props.previousText;
    previousButton.addEventListener("click", props.previous);
  } else {
    const hiddenDiv = document.createElement("div");
    hiddenDiv.ariaHidden = "true";
    // This div ensures elements are aligned correctly when there is no previous button
    buttons.push(hiddenDiv);
  }

  let continueButton: HTMLButtonElement | null = null;
  if (props.continueText) {
    continueButton = document.createElement("button");
    buttons.push(continueButton);
    continueButton.className = "flows_button flows_button_primary";
    continueButton.textContent = props.continueText;
    continueButton.addEventListener("click", props.continue);
  } else {
    const hiddenDiv = document.createElement("div");
    hiddenDiv.ariaHidden = "true";
    // This div ensures elements are aligned correctly when there is no continue button
    buttons.push(hiddenDiv);
  }

  const result = BaseTooltip({
    title: props.title,
    body: props.body,
    targetElement: props.targetElement,
    placement: props.placement,
    overlay: !props.hideOverlay,
    close: props.showCloseButton ? props.cancel : undefined,
    buttons,
  });

  return {
    element: result.element,
    cleanup: () => {
      result.cleanup();

      if (props.previous) previousButton?.removeEventListener("click", props.previous);
    },
  };
};
