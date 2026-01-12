import {
  type ComponentProps,
  type FloatingChecklistProps as LibraryFloatingChecklistProps,
} from "@flows/shared";
import { type FC, useCallback, useMemo, useRef, useState } from "react";
import { Text } from "../../internal-components/text";
import { ActionButton } from "../../internal-components/action-button";
import { Chevron16 } from "../../icons/chevron16";
import { Rocket16 } from "../../icons/rocket16";
import { ChecklistItem } from "./checklist-item";
import { ChecklistProgress } from "./checklist-progress";

export type FloatingChecklistProps = ComponentProps<LibraryFloatingChecklistProps>;

const CLOSE_TIMEOUT = 300;

const FloatingChecklist: FC<FloatingChecklistProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- value can be empty string ""
  const position = props.position || "bottom-right";

  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistClosing, setChecklistClosing] = useState(false);
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null);
  const toggleExpanded = useCallback((index: number) => {
    setExpandedItemIndex((currentIndex) => (currentIndex === index ? null : index));
  }, []);

  const completedItems = useMemo(
    () => props.items.filter((item) => item.completed.value),
    [props.items],
  );
  const isCompleted = props.items.length === completedItems.length;

  const closeTimeoutRef = useRef<number>(null);
  const handleClick = useCallback(() => {
    if (checklistOpen && !checklistClosing) {
      setChecklistClosing(true);
      closeTimeoutRef.current = window.setTimeout(() => {
        setChecklistOpen(false);
        setChecklistClosing(false);
        closeTimeoutRef.current = null;
      }, CLOSE_TIMEOUT);
    } else {
      const closeTimeout = closeTimeoutRef.current;
      if (closeTimeout !== null) {
        window.clearTimeout(closeTimeout);
        closeTimeoutRef.current = null;
      }
      setChecklistClosing(false);
      setChecklistOpen(true);
    }
  }, [checklistClosing, checklistOpen]);

  return (
    <div className="flows_basicsV2_floating_checklist" data-position={position}>
      <button
        type="button"
        className="flows_basicsV2_floating_checklist_widget_button"
        onClick={handleClick}
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
            <Text variant="title" className="flows_basicsV2_floating_checklist_title">
              {props.popupTitle}
            </Text>
            <Text variant="body">{props.popupDescription}</Text>
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
                {props.completeButton ? (
                  <ActionButton
                    variant="primary"
                    size="small"
                    action={props.completeButton}
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
