import { type ComponentProps, type Placement } from "@flows/shared";
import { BaseHint } from "../internal-components/base-hint";
import { type Component } from "../types";

export type HintProps = ComponentProps<{
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
}>;

export const Hint: Component<HintProps> = (props) => {
  const buttons: HTMLElement[] = [];

  let continueButton: HTMLButtonElement | null = null;
  if (props.continueText) {
    continueButton = document.createElement("button");
    buttons.push(continueButton);
    continueButton.className = "flows_button flows_button_primary";
    continueButton.textContent = props.continueText;
    continueButton.addEventListener("click", props.continue);
  }

  const result = BaseHint({
    title: props.title,
    body: props.body,
    targetElement: props.targetElement,
    offsetX: props.offsetX,
    offsetY: props.offsetY,
    placement: props.placement,
    buttons,
    onClose: props.showCloseButton ? props.close : undefined,
  });

  return {
    element: result.element,
    cleanup: () => {
      result.cleanup();

      continueButton?.removeEventListener("click", props.continue);
    },
  };
};
