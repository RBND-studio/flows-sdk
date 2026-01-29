import {
  type ComponentProps,
  type FloatingChecklistProps as LibraryFloatingChecklistProps,
} from "@flows/shared";
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line import/no-named-as-default -- correct import
import DOMPurify from "dompurify";
import { Text } from "../../internal-components/text";
import { ActionButton } from "../../internal-components/action-button";
import { Chevron16 } from "../../icons/chevron16";
import { Rocket16 } from "../../icons/rocket16";
import { usePrevious } from "../../hooks/use-previous";
import { ChecklistItem } from "./checklist-item";
import { ChecklistProgress } from "./checklist-progress";

export type FloatingChecklistProps = ComponentProps<LibraryFloatingChecklistProps>;

const CLOSE_TIMEOUT = 300;

const FloatingChecklist: FC<FloatingChecklistProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- value can be empty string ""
  const position = props.position || "bottom-right";
  const sessionStorageOpenKey = `floating-checklist-open-${props.__flows.id}`;

  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistClosing, setChecklistClosing] = useState(false);
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null);
  const toggleExpanded = useCallback((index: number) => {
    setExpandedItemIndex((currentIndex) => (currentIndex === index ? null : index));
  }, []);

  const [firstRender, setFirstRender] = useState(true);

  // Set initial open state from session storage or defaultOpen prop
  useEffect(() => {
    if (!firstRender) return;
    setFirstRender(false);

    const storedValue = window.sessionStorage.getItem(sessionStorageOpenKey);
    if (storedValue !== null) {
      setChecklistOpen(storedValue === "true");
    } else {
      setChecklistOpen(props.defaultOpen);
    }
  }, [firstRender, props.defaultOpen, sessionStorageOpenKey]);
  // Store open state in session storage
  useEffect(() => {
    if (firstRender) return;
    window.sessionStorage.setItem(sessionStorageOpenKey, String(checklistOpen));
  }, [checklistOpen, firstRender, sessionStorageOpenKey]);

  const prevItems = usePrevious(props.items);
  useEffect(() => {
    if (prevItems === undefined) return;

    props.items.forEach((item, index) => {
      const prevItem = prevItems.at(index);

      // Close the expanded item if it was completed
      if (
        prevItem &&
        !prevItem.completed.value &&
        item.completed.value &&
        expandedItemIndex === index
      ) {
        setExpandedItemIndex(null);
      }
    });
  }, [expandedItemIndex, prevItems, props.items]);

  const completedItems = useMemo(
    () => props.items.filter((item) => item.completed.value),
    [props.items],
  );
  const isCompleted = props.items.length === completedItems.length;

  const closeTimeoutRef = useRef<number>(null);
  const handleClose = useCallback(() => {
    window.clearTimeout(closeTimeoutRef.current ?? undefined);
    closeTimeoutRef.current = null;
    setChecklistClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      setChecklistOpen(false);
      setChecklistClosing(false);
      closeTimeoutRef.current = null;
    }, CLOSE_TIMEOUT);
  }, []);
  const handleOpen = useCallback(() => {
    window.clearTimeout(closeTimeoutRef.current ?? undefined);
    closeTimeoutRef.current = null;
    setChecklistClosing(false);
    setChecklistOpen(true);
  }, []);
  const handleClick = useCallback(() => {
    if (checklistOpen && !checklistClosing) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [checklistClosing, checklistOpen, handleClose, handleOpen]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleItemClick = useCallback(() => {
    if (props.hideOnClick) {
      handleClose();
      // Restore focus to the button after closing
      buttonRef.current?.focus();
    }
  }, [handleClose, props.hideOnClick]);

  useEffect(() => {
    if (!props.openOnItemCompleted || prevItems === undefined) return;

    props.items.forEach((item, index) => {
      const prevItem = prevItems.at(index);

      // Open the checklist if an item was just completed
      if (prevItem && !prevItem.completed.value && item.completed.value) {
        const isManualTrigger =
          item.completed.triggers.length === 1 && item.completed.triggers.at(0)?.type === "manual";
        if (!isManualTrigger) handleOpen();
      }
    });
  }, [handleOpen, prevItems, props.items, props.openOnItemCompleted]);

  return (
    <div className="flows_basicsV2_floating_checklist" data-position={position}>
      <button
        type="button"
        className="flows_basicsV2_floating_checklist_widget_button"
        onClick={handleClick}
        ref={buttonRef}
      >
        <Rocket16 aria-hidden="true" />
        {props.widgetTitle}
        <Chevron16
          className="flows_basicsV2_floating_checklist_widget_button_chevron"
          data-open={checklistOpen && !checklistClosing ? "true" : "false"}
          aria-hidden="true"
        />
      </button>

      {checklistOpen ? (
        <div
          className="flows_basicsV2_floating_checklist_popover"
          data-open={!checklistClosing ? "true" : "false"}
        >
          <div className="flows_basicsV2_floating_checklist_header">
            {props.popupTitle ? (
              <Text
                variant="title"
                className="flows_basicsV2_floating_checklist_title"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(props.popupTitle, {
                    FORCE_BODY: true,
                    ADD_ATTR: ["target"],
                  }),
                }}
              />
            ) : null}
            {props.popupDescription ? (
              <Text
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(props.popupDescription, {
                    FORCE_BODY: true,
                    ADD_ATTR: ["target"],
                  }),
                }}
              />
            ) : null}
          </div>

          <ChecklistProgress
            completedItems={completedItems.length}
            totalItems={props.items.length}
          />

          {!isCompleted && (
            <div className="flows_basicsV2_floating_checklist_items">
              {props.items.map((item, index) => (
                <ChecklistItem
                  // eslint-disable-next-line react/no-array-index-key -- the list order and length won't change
                  key={index}
                  index={index}
                  expanded={expandedItemIndex === index}
                  toggleExpanded={toggleExpanded}
                  onClick={handleItemClick}
                  {...item}
                />
              ))}
              {props.skipButton ? (
                <div className="flows_basicsV2_floating_checklist_skip_button">
                  <ActionButton variant="text" action={props.skipButton} />
                </div>
              ) : null}
            </div>
          )}
          {isCompleted ? (
            <div className="flows_basicsV2_floating_checklist_completed">
              <div className="flows_basicsV2_floating_checklist_completed_inner">
                <Text variant="title" className="flows_basicsV2_floating_checklist_completed_title">
                  {props.completedTitle}
                </Text>
                <Text
                  variant="body"
                  className="flows_basicsV2_floating_checklist_completed_description"
                >
                  {props.completedDescription}
                </Text>
                {props.completedButton ? (
                  <ActionButton
                    variant="primary"
                    size="small"
                    action={props.completedButton}
                    className="flows_basicsV2_floating_checklist_completed_button"
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export const BasicsV2FloatingChecklist = FloatingChecklist;
