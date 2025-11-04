"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FC, type ReactNode } from "react";
import {
  useFloating,
  shift,
  offset,
  arrow,
  flip,
  type Side,
  type Placement,
  autoUpdate as floatingAutoUpdate,
} from "@floating-ui/react-dom";
import classNames from "classnames";
import { log } from "@flows/shared";
import { Close16 } from "../icons/close16";
import { useQuerySelector } from "../hooks/use-query-selector";
import { Text } from "./text";
import { IconButton } from "./icon-button";

const DISTANCE = 4;
const ARROW_SIZE = 6;
const OFFSET_DISTANCE = DISTANCE + ARROW_SIZE;
const BOUNDARY_PADDING = 8;
const ARROW_EDGE_PADDING = 8;

interface Props {
  title: string;
  body: string;
  targetElement: string;
  buttons?: ReactNode;
  onClose?: () => void;
  placement?: Placement;
  overlay?: boolean;
  dots?: ReactNode;
}

const autoUpdate: typeof floatingAutoUpdate = (ref, floating, update) =>
  floatingAutoUpdate(ref, floating, update, { animationFrame: true });

export const BaseTooltip: FC<Props> = (props) => {
  const topArrowRef = useRef<HTMLDivElement>(null);
  const bottomArrowRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const reference = useQuerySelector(props.targetElement);
  const { refs, middlewareData, placement, x, y } = useFloating({
    placement: props.placement,
    elements: { reference },
    whileElementsMounted: autoUpdate,
    middleware: [
      flip({ fallbackPlacements: ["top", "bottom", "left", "right"] }),
      shift({ crossAxis: true, padding: BOUNDARY_PADDING }),
      arrow({ element: bottomArrowRef, padding: ARROW_EDGE_PADDING }),
      offset(OFFSET_DISTANCE),
    ],
  });

  const [enterAnimationEnded, setEnterAnimationEnded] = useState(false);
  useEffect(() => {
    // Show enter animation in tour after the tooltip was hidden because the target element isn't on page
    if (!reference) setEnterAnimationEnded(false);
  }, [reference]);
  useEffect(() => {
    if (enterAnimationEnded) return;
    const el = refs.floating.current;
    if (!el) return;
    const hasAnimation = window.getComputedStyle(el).animationName !== "none";
    if (!hasAnimation) {
      setEnterAnimationEnded(true);
    }
  }, [enterAnimationEnded, refs.floating]);
  const handleAnimationEnd = useCallback((): void => {
    setEnterAnimationEnded(true);
  }, []);

  const staticSide = useMemo((): Side => {
    if (placement.includes("top")) return "bottom";
    if (placement.includes("bottom")) return "top";
    if (placement.includes("left")) return "right";
    return "left";
  }, [placement]);

  useEffect(() => {
    if (!props.targetElement) {
      log.error("Cannot render Tooltip without target element");
    }
  }, [props.targetElement]);

  if (!reference) return null;

  if (refs.floating.current) {
    refs.floating.current.style.left = `${x}px`;
    refs.floating.current.style.top = `${y}px`;
  }

  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;
  [bottomArrowRef, topArrowRef].forEach((arrowRef) => {
    if (!arrowRef.current) return;
    // eslint-disable-next-line eqeqeq -- null check is intended here
    arrowRef.current.style.left = arrowX != null ? `${arrowX}px` : "";
    // eslint-disable-next-line eqeqeq -- null check is intended here
    arrowRef.current.style.top = arrowY != null ? `${arrowY}px` : "";
    arrowRef.current.style.right = "";
    arrowRef.current.style.bottom = "";
    arrowRef.current.style[staticSide] = `${-ARROW_SIZE}px`;
  });

  if (overlayRef.current) {
    const targetPosition = reference.getBoundingClientRect();
    overlayRef.current.style.top = `${targetPosition.top}px`;
    overlayRef.current.style.left = `${targetPosition.left}px`;
    overlayRef.current.style.width = `${targetPosition.width}px`;
    overlayRef.current.style.height = `${targetPosition.height}px`;
  }

  return (
    <div className="flows_tooltip_root">
      {props.overlay ? <div className="flows_tooltip_overlay" ref={overlayRef} /> : null}
      <div
        className="flows_tooltip_tooltip"
        ref={refs.setFloating}
        data-open={enterAnimationEnded ? "true" : "false"}
        onAnimationEnd={handleAnimationEnd}
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

        <div
          className={classNames("flows_tooltip_arrow", "flows_tooltip_arrow-bottom")}
          ref={bottomArrowRef}
        />
        <div
          className={classNames("flows_tooltip_arrow", "flows_tooltip_arrow-top")}
          ref={topArrowRef}
        />
      </div>
    </div>
  );
};
