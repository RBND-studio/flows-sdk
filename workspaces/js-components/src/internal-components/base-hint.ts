import { type Placement } from "@flows/shared";
import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import { html, type TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Close16 } from "../icons/close-16";
import { Text } from "./text";
import { IconButton } from "./icon-button";

interface Props {
  title: string;
  body: string;

  targetElement: string;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;

  buttons: TemplateResult[];
  onClose?: () => void;

  open: boolean;
  tooltipClosing: boolean;
  handleOpen: () => void;
  handleClose: () => void;
}

const BOUNDARY_PADDING = 8;
const DISTANCE = 4;

export const BaseHint = (props: Props): TemplateResult => {
  return html`
    <button
      aria-label="Open hint"
      type="button"
      class="flows_hint_hotspot"
      @click=${props.open ? props.handleOpen : props.handleClose}
    ></button>

    ${props.open
      ? html`
          <div
            data-open=${!props.tooltipClosing ? "true" : "false"}
            class="flows_tooltip_tooltip flows_hint_tooltip"
          >
            ${Text({ className: "flows_tooltip_title", variant: "title", children: props.title })}
            ${Text({
              className: "flows_tooltip_body",
              variant: "body",
              children: unsafeHTML(props.body),
            })}
            ${props.buttons.length
              ? html`<div class="flows_tooltip_footer">${props.buttons}</div>`
              : null}
            ${props.onClose
              ? IconButton({
                  children: Close16(),
                  className: "flows_tooltip_close",
                  "aria-label": "Close",
                  onClick: props.onClose,
                })
              : null}
          </div>
        `
      : null}
  `;
};

// export const BaseHint: _Component<Props> = (props) => {
//   // TODO: setup auto update based on reference element change
//   const reference = props.targetElement ? document.querySelector(props.targetElement) : null;
//   if (!reference) {
//     if (!props.targetElement) log.error("Cannot render Hint without target element");

//     return {
//       element: null,
//       cleanup: () => {
//         // Do nothing
//       },
//     };
//   }

//   const root = document.createElement("div");

//   const targetButton = document.createElement("button");
//   root.appendChild(targetButton);
//   targetButton.className = "flows_hint_hotspot";
//   targetButton.setAttribute("aria-label", "Open hint");
//   targetButton.type = "button";

//   let tooltipCleanup: (() => void) | null = null;

//   const handleTargetButtonClick = (): void => {
//     if (tooltipCleanup) {
//       tooltipCleanup();
//       return;
//     }

//     const tooltip = document.createElement("div");
//     root.appendChild(tooltip);
//     tooltip.className = "flows_tooltip_tooltip flows_hint_tooltip";
//     tooltip.setAttribute("data-open", "true");

//     const title = document.createElement("p");
//     tooltip.appendChild(title);
//     title.className = "flows_text flows_text_title flows_tooltip_title";
//     title.textContent = props.title;

//     const body = document.createElement("p");
//     tooltip.appendChild(body);
//     body.className = "flows_text flows_text_body flows_tooltip_body";
//     body.innerHTML = props.body;

//     if (props.buttons.length) {
//       const footer = document.createElement("div");
//       tooltip.appendChild(footer);
//       footer.className = "flows_tooltip_footer";
//       props.buttons.forEach((button) => footer.appendChild(button));
//     }

//     let closeButton: HTMLButtonElement | null = null;
//     if (props.onClose) {
//       closeButton = document.createElement("button");
//       tooltip.appendChild(closeButton);
//       closeButton.className = "flows_iconButton flows_tooltip_close";
//       closeButton.setAttribute("aria-label", "Close");
//       closeButton.appendChild(close16());
//       closeButton.addEventListener("click", props.onClose);
//     }

//     const tooltipPositionCleanup = autoUpdate(
//       reference,
//       tooltip,
//       () =>
//         void updateTooltip({
//           el: tooltip as HTMLElement,
//           reference: targetButton,
//           placement: props.placement,
//         }),
//       { animationFrame: true },
//     );

//     const handleWindowClick = (e: MouseEvent): void => {
//       const target = e.target as Node;
//       if (!target.isConnected) return;

//       const isOutside = !tooltip.contains(target) && !targetButton.contains(target);
//       if (isOutside) tooltipCleanup?.();
//     };
//     window.addEventListener("click", handleWindowClick);

//     tooltipCleanup = () => {
//       if (props.onClose) closeButton?.removeEventListener("click", props.onClose);
//       window.removeEventListener("click", handleWindowClick);
//       tooltipPositionCleanup();
//       tooltip.remove();
//       tooltipCleanup = null;
//     };
//   };

//   targetButton.addEventListener("click", handleTargetButtonClick);

//   const buttonPositionCleanup = autoUpdate(
//     reference,
//     targetButton,
//     () => void updateTargetButton({ el: targetButton, reference, placement: props.placement }),
//     { animationFrame: true },
//   );

//   return {
//     element: root,
//     cleanup: () => {
//       tooltipCleanup?.();
//       buttonPositionCleanup();
//       targetButton.removeEventListener("click", handleTargetButtonClick);
//     },
//   };
// };

export const updateTargetButton = ({
  reference,
  el,
  placement,
  offsetX,
  offsetY,
}: {
  reference: Element;
  el: HTMLElement;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;
}): Promise<void> => {
  return computePosition(reference, el, {
    placement,
  }).then(({ x, y }) => {
    el.style.left = `${x + (offsetX ?? 0)}px`;
    el.style.top = `${y + (offsetY ?? 0)}px`;
  });
};

export const updateTooltip = ({
  el,
  reference,
  placement,
}: {
  reference: Element;
  el: HTMLElement;
  placement?: Placement;
}): Promise<void> => {
  return computePosition(reference, el, {
    placement,
    middleware: [
      flip({ fallbackPlacements: ["top", "bottom", "left", "right"] }),
      shift({ crossAxis: true, padding: BOUNDARY_PADDING }),
      offset(DISTANCE),
    ],
  }).then(({ x, y }) => {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  });
};
