import { type ComponentProps, type ChecklistProps as LibraryChecklistProps } from "@flows/shared";
import { type FC, useCallback, useState } from "react";
import { Text } from "../../internal-components/text";
import { ActionButton } from "../../internal-components/action-button";
import { Chevron16 } from "../../icons/chevron16";
import { Rocket16 } from "../../icons/rocket16";
import { ChecklistItem } from "./checklist-item";
import { ChecklistProgress } from "./checklist-progress";

export type ChecklistProps = ComponentProps<LibraryChecklistProps>;

const CLOSE_TIMEOUT = 300;

const Checklist: FC<ChecklistProps> = (props) => {
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistClosing, setChecklistClosing] = useState(false);
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null);
  const toggleExpanded = useCallback((index: number) => {
    setExpandedItemIndex((currentIndex) => (currentIndex === index ? null : index));
  }, []);

  const totalItems = props.items.length;
  const completedItems = props.items.filter((item) => item.completed.value).length;

  const handleOpen = useCallback(() => {
    setChecklistOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setChecklistClosing(true);
    setTimeout(() => {
      setChecklistOpen(false);
      setChecklistClosing(false);
    }, CLOSE_TIMEOUT);
  }, []);

  return (
    <div className="flows_basicsV2_checklist" data-position={props.position}>
      <button
        type="button"
        className="flows_basicsV2_checklist_widget_button"
        onClick={checklistOpen ? handleClose : handleOpen}
      >
        <Rocket16 aria-hidden="true" />
        {props.widgetTitle}
        <Chevron16
          className="flows_basicsV2_checklist_widget_button_chevron"
          data-open={checklistOpen && !checklistClosing ? "true" : "false"}
          aria-hidden="true"
        />
      </button>

      {checklistOpen ? (
        <div
          className="flows_basicsV2_checklist_popover"
          data-open={!checklistClosing ? "true" : "false"}
        >
          <div className="flows_basicsV2_checklist_header">
            <Text variant="title" className="flows_basicsV2_checklist_title">
              {props.popupTitle}
            </Text>
            <Text variant="body">{props.popupDescription}</Text>
          </div>

          <ChecklistProgress completedItems={completedItems} totalItems={totalItems} />

          <div className="flows_basicsV2_checklist_items">
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
              <div className="flows_basicsV2_checklist_skip_button">
                <ActionButton variant="text" action={props.skipButton} />{" "}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const BasicsV2Checklist = Checklist;
