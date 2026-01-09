import { type ChecklistItem as ChecklistItemType } from "@flows/shared";
import { type FC, type ReactNode, useCallback, useEffect, useRef } from "react";
import { Text } from "../../internal-components/text";
import { ActionButton } from "../../internal-components/action-button";
import { Check16 } from "../../icons/check16";
import { Chevron16 } from "../../icons/chevron16";

type Props = ChecklistItemType & {
  index: number;
  expanded: boolean;
  toggleExpanded: (index: number) => void;
};

export const ChecklistItem: FC<Props> = (props) => {
  const toggleExpanded = useCallback(() => {
    props.toggleExpanded(props.index);
  }, [props]);

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
    <div
      className="flows_basicsV2_checklist_item"
      data-expanded={props.expanded ? "true" : "false"}
    >
      <button
        type="button"
        className="flows_basicsV2_checklist_item_expand_button"
        onClick={toggleExpanded}
        data-expanded={props.expanded ? "true" : "false"}
      >
        <Indicator completed={props.completed.value} />
        <span className="flows_basicsV2_checklist_item_title">{props.title}</span>
        <Chevron16
          className="flows_basicsV2_checklist_item_chevron"
          data-expanded={props.expanded ? "true" : "false"}
          aria-hidden="true"
        />
      </button>
      <div
        className="flows_basicsV2_checklist_item_content"
        ref={expandRef}
        data-expanded={props.expanded ? "true" : "false"}
      >
        <div className="flows_basicsV2_checklist_item_content_inner">
          {props.description ? <Text variant="body">{props.description}</Text> : null}
          {(props.primaryButton ?? props.secondaryButton) ? (
            <div className="flows_basicsV2_checklist_item_buttons">
              {props.primaryButton ? (
                <ActionButton action={props.primaryButton} variant="primary" size="small" />
              ) : null}
              {props.secondaryButton ? (
                <ActionButton action={props.secondaryButton} variant="secondary" size="small" />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Indicator = ({ completed }: { completed: boolean }): ReactNode => {
  if (completed) {
    return (
      <div className="flows_basicsV2_checklist_item_indicator flows_basicsV2_checklist_item_indicator_completed">
        <Check16 />
      </div>
    );
  }

  return <div className="flows_basicsV2_checklist_item_indicator" />;
};
