import { log, type Placement } from "@flows/shared";
import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Side,
} from "@floating-ui/dom";
import { type Component } from "../types";
import { close16 } from "../icons/close-16";

export interface TooltipProps {
  title: string;
  body: string;
  continueText?: string;
  targetElement: string;
  showCloseButton: boolean;
  placement?: Placement;
  hideOverlay?: boolean;

  continue: () => void;
  close: () => void;
}

export const Tooltip: Component<TooltipProps> = (props) => {
  const root = document.createElement("div");
  root.className = "flows_tooltip_root";

  let overlay: HTMLDivElement | null = null;
  if (!props.hideOverlay) {
    overlay = document.createElement("div");
    root.appendChild(overlay);
    overlay.className = "flows_tooltip_overlay";
    overlay.ariaHidden = "true";
    overlay.addEventListener("click", props.close);
  }

  const tooltip = document.createElement("div");
  root.appendChild(tooltip);
  tooltip.className = "flows_tooltip_tooltip";

  const title = document.createElement("p");
  tooltip.appendChild(title);
  title.className = "flows_text flows_text_title flows_tooltip_title";
  title.textContent = props.title;

  const body = document.createElement("p");
  tooltip.appendChild(body);
  body.className = "flows_text flows_text_body flows_tooltip_body";
  body.innerHTML = props.body;

  const footer = document.createElement("div");
  tooltip.appendChild(footer);
  footer.className = "flows_tooltip_footer";

  let continueButton: HTMLButtonElement | null = null;
  if (props.continueText) {
    continueButton = document.createElement("button");
    footer.appendChild(continueButton);
    continueButton.className = "flows_button flows_button_primary";
    continueButton.textContent = props.continueText;
    continueButton.addEventListener("click", props.continue);
  }

  let closeButton: HTMLButtonElement | null = null;
  if (props.showCloseButton) {
    closeButton = document.createElement("button");
    footer.appendChild(closeButton);
    closeButton.className = "flows_iconButton flows_tooltip_close";
    closeButton.appendChild(close16());
    closeButton.addEventListener("click", props.close);
  }

  const bottomArrow = document.createElement("div");
  tooltip.appendChild(bottomArrow);
  bottomArrow.className = "flows_tooltip_arrow flows_tooltip_arrow-bottom";

  const topArrow = document.createElement("div");
  tooltip.appendChild(topArrow);
  topArrow.className = "flows_tooltip_arrow flows_tooltip_arrow-top";

  // TODO: setup auto update based on reference element change
  const reference = document.querySelector(props.targetElement);
  let positionCleanup: (() => void) | null = null;
  if (reference) {
    positionCleanup = autoUpdate(
      reference,
      tooltip,
      () =>
        void updateTooltip({
          reference,
          tooltip,
          arrowEls: [bottomArrow, topArrow],
          overlay,
          placement: props.placement,
        }),
    );
  }

  return {
    element: root,
    cleanup: () => {
      positionCleanup?.();

      overlay?.removeEventListener("click", props.close);
      continueButton?.removeEventListener("click", props.continue);
      closeButton?.removeEventListener("click", props.close);
    },
  };
};

const DISTANCE = 4;
const ARROW_SIZE = 6;
const OFFSET_DISTANCE = DISTANCE + ARROW_SIZE;
const BOUNDARY_PADDING = 8;
const ARROW_EDGE_PADDING = 8;

export const updateTooltip = ({
  reference,
  tooltip,
  placement,
  arrowEls,
  overlay,
}: {
  reference: Element;
  tooltip: HTMLElement;
  placement?: Placement;
  arrowEls: [HTMLElement, HTMLElement];
  overlay: HTMLElement | null;
}): Promise<void> => {
  if (overlay) {
    const targetPosition = reference.getBoundingClientRect();
    overlay.style.top = `${targetPosition.top}px`;
    overlay.style.left = `${targetPosition.left}px`;
    overlay.style.width = `${targetPosition.width}px`;
    overlay.style.height = `${targetPosition.height}px`;
  }

  return computePosition(reference, tooltip, {
    placement,
    middleware: [
      flip({ fallbackPlacements: ["top", "bottom", "left", "right"] }),
      shift({ crossAxis: true, padding: BOUNDARY_PADDING }),
      arrow({ element: arrowEls[0], padding: ARROW_EDGE_PADDING }),
      offset(OFFSET_DISTANCE),
    ],
  })
    .then(({ x, y, middlewareData, placement: finalPlacement }) => {
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;

      if (middlewareData.arrow) {
        const staticSide = ((): Side => {
          if (finalPlacement.includes("top")) return "bottom";
          if (finalPlacement.includes("bottom")) return "top";
          if (finalPlacement.includes("left")) return "right";
          return "left";
        })();
        const arrowX = middlewareData.arrow.x;
        const arrowY = middlewareData.arrow.y;

        arrowEls.forEach((arrowEl) => {
          // eslint-disable-next-line eqeqeq -- null check is intended here
          arrowEl.style.left = arrowX != null ? `${arrowX}px` : "";
          // eslint-disable-next-line eqeqeq -- null check is intended here
          arrowEl.style.top = arrowY != null ? `${arrowY}px` : "";
          arrowEl.style.right = "";
          arrowEl.style.bottom = "";
          arrowEl.style[staticSide] = `${-ARROW_SIZE}px`;
        });
      }
    })
    .catch((err: unknown) => {
      log.error("Error computing position", err);
    });
};
