import { type ComponentProps, type ChecklistProps as LibraryChecklistProps } from "@flows/shared";
import { type FC, useCallback, useState } from "react";
import { Text } from "../../internal-components/text";
import { IconButton } from "../../internal-components/icon-button";
import { Close16 } from "../../icons/close16";
import { ActionButton } from "../../internal-components/action-button";
import { ChecklistItem } from "./checklist-item";

export type ChecklistProps = ComponentProps<LibraryChecklistProps>;

const CLOSE_TIMEOUT = 300;

const Checklist: FC<ChecklistProps> = (props) => {
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [checklistClosing, setChecklistClosing] = useState(false);

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
        {props.widgetTitle}
      </button>

      {checklistOpen ? (
        <div
          className="flows_basicsV2_checklist_popover"
          data-open={!checklistClosing ? "true" : "false"}
        >
          <Text variant="title" className="flows_basicsV2_checklist_title">
            {props.popupTitle}
          </Text>
          <Text variant="body">{props.popupDescription}</Text>

          <div className="flows_basicsV2_checklist_items">
            {props.items.map((item, index) => (
              // eslint-disable-next-line react/no-array-index-key -- the list order and length won't change
              <ChecklistItem key={index} {...item} />
            ))}
          </div>

          {props.secondaryButton ? (
            <ActionButton variant="secondary" action={props.secondaryButton} />
          ) : null}
          <IconButton
            aria-label="Close"
            className="flows_basicsV2_checklist_close"
            onClick={props.close}
          >
            <Close16 />
          </IconButton>
        </div>
      ) : null}
    </div>
  );
};

export const BasicsV2Checklist = Checklist;
