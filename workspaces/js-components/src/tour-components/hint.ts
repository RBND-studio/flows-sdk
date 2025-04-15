import { type Placement, type TourComponentProps } from "@flows/shared";
import { type Component } from "../types";
import { BaseHint } from "../internal-components/base-hint";

export type HintProps = TourComponentProps<{
  title: string;
  body: string;
  continueText?: string;
  previousText?: string;
  showCloseButton: boolean;

  targetElement: string;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;
}>;

const hiddenDiv = (): HTMLElement => {
  const div = document.createElement("div");
  div.ariaHidden = "true";
  return div;
};

export const Hint: Component<HintProps> = (props) => {
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

  const result = BaseHint({
    title: props.title,
    body: props.body,
    targetElement: props.targetElement,
    offsetX: props.offsetX,
    offsetY: props.offsetY,
    placement: props.placement,
    onClose: props.showCloseButton ? props.cancel : undefined,
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
