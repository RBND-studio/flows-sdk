import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react-dom";
import { type Placement } from "@flows/shared";
import { useCallback, useEffect, useState, type FC } from "react";
import { useQuerySelector } from "../hooks/use-query-selector";
import { Close16 } from "../icons/close16";
import { Text } from "./text";
import { IconButton } from "./icon-button";

interface Props {
  title: string;
  body: string;

  targetElement: string;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;

  onClose?: () => void;
}

const WIDTH = 16;
const HEIGHT = 16;
const CLOSE_TIMEOUT = 300;
const BOUNDARY_PADDING = 8;
const DISTANCE = 4;

export const BaseHint: FC<Props> = (props) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const handleOpen = useCallback(() => {
    setTooltipOpen(true);
  }, []);

  const reference = useQuerySelector(props.targetElement);
  const targetFloating = useFloating({
    placement: props.placement,
    elements: { reference },
    whileElementsMounted: autoUpdate,
    transform: true,
  });
  const dotRef = targetFloating.refs.floating;

  const tooltipFloating = useFloating({
    placement: "bottom",
    elements: { reference: targetFloating.refs.floating.current },
    whileElementsMounted: autoUpdate,
    transform: false,
    open: tooltipOpen,
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

  if (!reference) return null;

  return (
    <>
      <button
        ref={targetFloating.refs.setFloating}
        style={{
          ...targetFloating.floatingStyles,
          width: WIDTH,
          height: HEIGHT,
        }}
        aria-label={props.title}
        type="button"
        className="flows_hint_target"
        onClick={tooltipOpen ? handleClose : handleOpen}
      />

      {tooltipOpen ? (
        <div
          className="flows_tooltip_tooltip flows_hint_tooltip"
          data-open={!tooltipClosing && tooltipFloating.isPositioned ? "true" : "false"}
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
