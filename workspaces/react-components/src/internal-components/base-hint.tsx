import {
  flip,
  offset,
  shift,
  useFloating,
  autoUpdate as floatingAutoUpdate,
} from "@floating-ui/react-dom";
import { log, type Placement } from "@flows/shared";
import { type ReactNode, useCallback, useEffect, useState, type FC } from "react";
import { useQuerySelector } from "../hooks/use-query-selector";
import { Close16 } from "../icons/close16";
import { useFirstRender } from "../hooks/use-first-render";
import { Text } from "./text";
import { IconButton } from "./icon-button";

interface Props {
  title: string;
  body: string;

  targetElement: string;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;

  buttons?: ReactNode;
  dots?: ReactNode;
  onClose?: () => void;
}

const CLOSE_TIMEOUT = 300;
const BOUNDARY_PADDING = 8;
const DISTANCE = 4;

const autoUpdate: typeof floatingAutoUpdate = (ref, floating, update) =>
  floatingAutoUpdate(ref, floating, update, { animationFrame: true });

export const BaseHint: FC<Props> = (props) => {
  const firstRender = useFirstRender();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const handleOpen = useCallback(() => {
    setTooltipOpen(true);
  }, []);

  const reference = useQuerySelector(props.targetElement);
  const targetFloating = useFloating({
    placement: props.placement,
    elements: { reference },
    whileElementsMounted: autoUpdate,
    transform: false,
  });
  const dotRef = targetFloating.refs.floating;

  const tooltipFloating = useFloating({
    placement: "bottom",
    elements: { reference: targetFloating.refs.floating.current },
    whileElementsMounted: autoUpdate,
    transform: false,
    middleware: [
      flip({ fallbackPlacements: ["top", "bottom", "left", "right"] }),
      shift({ crossAxis: true, padding: BOUNDARY_PADDING }),
      offset(DISTANCE),
    ],
  });
  const tooltipRef = tooltipFloating.refs.floating;

  const [tooltipClosing, setTooltipClosing] = useState(false);
  const handleClose = useCallback(() => {
    setTooltipClosing(true);
    setTimeout(() => {
      setTooltipOpen(false);
      setTooltipClosing(false);
    }, CLOSE_TIMEOUT);
  }, []);

  useEffect(() => {
    const handleWindowClick = (e: MouseEvent): void => {
      const target = e.target as Node;
      const tooltipEl = tooltipRef.current;
      const dotEl = dotRef.current;

      if (!tooltipEl || !target.isConnected) return;

      const isOutside = !tooltipEl.contains(target) && !dotEl?.contains(target);
      if (isOutside) handleClose();
    };
    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, [handleClose, dotRef, tooltipRef]);

  useEffect(() => {
    if (!props.targetElement) {
      log.error("Cannot render Hint without target element");
    }
  }, [props.targetElement]);

  if (!reference) return null;
  // Avoid rendering on client render to prevent hydration issues
  if (firstRender) return null;

  return (
    <>
      <button
        ref={targetFloating.refs.setFloating}
        style={{
          left: targetFloating.x + (props.offsetX ?? 0),
          top: targetFloating.y + (props.offsetY ?? 0),
        }}
        aria-label="Open hint"
        type="button"
        className="flows_hint_hotspot"
        onClick={tooltipOpen ? handleClose : handleOpen}
      />

      {tooltipOpen ? (
        <div
          className="flows_tooltip_tooltip flows_hint_tooltip"
          data-open={!tooltipClosing ? "true" : "false"}
          ref={tooltipFloating.refs.setFloating}
          style={{ left: tooltipFloating.x, top: tooltipFloating.y }}
        >
          <Text className="flows_tooltip_title" variant="title">
            {props.title}
          </Text>
          <Text
            variant="body"
            className="flows_tooltip_body"
            dangerouslySetInnerHTML={{ __html: props.body }}
          />
          {(props.dots ?? props.buttons) ? (
            <div className="flows_tooltip_footer">
              {props.dots}
              {props.buttons ? (
                <div className="flows_tooltip_buttons_wrapper">
                  <div className="flows_tooltip_buttons">{props.buttons}</div>
                </div>
              ) : null}
            </div>
          ) : null}

          {props.onClose ? (
            <IconButton aria-label="Close" className="flows_tooltip_close" onClick={props.onClose}>
              <Close16 />
            </IconButton>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
