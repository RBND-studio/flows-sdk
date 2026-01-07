import { type ChecklistItem as ChecklistItemType } from "@flows/shared";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { Text } from "../../internal-components/text";
import { ActionButton } from "../../internal-components/action-button";

type Props = ChecklistItemType;

export const ChecklistItem: FC<Props> = (props) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const expandRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (expandRef.current) {
      expandRef.current.style.setProperty(
        "--flows-content-height",
        `${expandRef.current.scrollHeight}px`,
      );
    }
  }, []);

  return (
    <div className="flows_basicsV2_checklist_item">
      <button
        type="button"
        className="flows_basicsV2_checklist_item_expand_button"
        onClick={toggleExpanded}
      >
        <input type="checkbox" onChange={() => null} checked={props.completed.value} />
        {props.title}
      </button>
      <div
        ref={expandRef}
        className="flows_basicsV2_checklist_item_content"
        data-expanded={expanded ? "true" : "false"}
      >
        <Text variant="body">{props.description}</Text>
        {(props.primaryButton ?? props.secondaryButton) ? (
          <div className="flows_basicsV2_checklist_item_buttons">
            {props.primaryButton ? (
              <ActionButton action={props.primaryButton} variant="primary" />
            ) : null}
            {props.secondaryButton ? (
              <ActionButton action={props.secondaryButton} variant="secondary" />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};
