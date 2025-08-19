import { type FlowsProperties, type ComponentProps, type Placement } from "@flows/shared";
import { LitElement } from "lit";
import { property } from "lit/decorators.js";

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

export class Hint extends LitElement implements HintProps {
  @property({ type: String })
  title: string;

  @property({ type: String })
  body: string;

  @property({ type: String })
  continueText?: string;

  @property({ type: Boolean })
  showCloseButton: boolean;

  @property({ type: String })
  targetElement: string;

  @property({ type: Number })
  offsetX?: number;

  @property({ type: Number })
  offsetY?: number;

  @property({ type: Function })
  continue: () => void;

  @property({ type: Function })
  close: () => void;

  __flows: FlowsProperties;
}

// export const Hint: Component<HintProps> = (props) => {
//   const buttons: HTMLElement[] = [];

//   let continueButton: HTMLButtonElement | null = null;
//   if (props.continueText) {
//     continueButton = document.createElement("button");
//     buttons.push(continueButton);
//     continueButton.className = "flows_button flows_button_primary";
//     continueButton.textContent = props.continueText;
//     continueButton.addEventListener("click", props.continue);
//   }

//   const result = BaseHint({
//     title: props.title,
//     body: props.body,
//     targetElement: props.targetElement,
//     offsetX: props.offsetX,
//     offsetY: props.offsetY,
//     placement: props.placement,
//     buttons,
//     onClose: props.showCloseButton ? props.close : undefined,
//   });

//   return {
//     element: result.element,
//     cleanup: () => {
//       result.cleanup();

//       continueButton?.removeEventListener("click", props.continue);
//     },
//   };
// };
