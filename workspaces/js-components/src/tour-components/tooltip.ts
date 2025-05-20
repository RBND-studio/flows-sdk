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

const hiddenDiv = (): HTMLElement => {
  const div = document.createElement("div");
  div.setAttribute("aria-hidden", "true");
  return div;
};

export const Tooltip: Component<TooltipProps> = (props) => {
  let previousButton: HTMLButtonElement | null = null;
  if (props.previous && props.previousText) {
    previousButton = document.createElement("button");
    previousButton.className = "flows_button flows_button_secondary";
    previousButton.textContent = props.previousText;
    previousButton.addEventListener("click", props.previous);
  }

  let continueButton: HTMLButtonElement | null = null;
  if (props.continueText) {
    continueButton = document.createElement("button");
    continueButton.className = "flows_button flows_button_primary";
    continueButton.textContent = props.continueText;
    continueButton.addEventListener("click", props.continue);
  }

  const buttons =
    Boolean(continueButton) || Boolean(previousButton)
      ? [
          //  The empty div ensures elements are aligned correctly when there is no continue button
          previousButton ?? hiddenDiv(),
          continueButton ?? hiddenDiv(),
        ]
      : [];

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
      continueButton?.removeEventListener("click", props.continue);
      if (props.previous) previousButton?.removeEventListener("click", props.previous);

      result.cleanup();
    },
  };
};
