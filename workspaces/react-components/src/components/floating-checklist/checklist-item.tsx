import { type StateMemory, type ChecklistItem as ChecklistItemType } from "@flows/shared";
import { type FC, type ReactNode, useCallback, useEffect, useRef } from "react";
// eslint-disable-next-line import/no-named-as-default -- correct import
import DOMPurify from "dompurify";
import { Text } from "../../internal-components/text";
import { ActionButton } from "../../internal-components/action-button";
import { Check16 } from "../../icons/check16";
import { Chevron16 } from "../../icons/chevron16";

type Props = ChecklistItemType & {
  index: number;
  expanded: boolean;
  toggleExpanded: (index: number) => void;
  onNonManualButtonClick: () => void;
};

const getIsManualTrigger = (completed: StateMemory): boolean => {
  const isManualTrigger =
    completed.triggers.length === 1 && completed.triggers.at(0)?.type === "manual";
  return isManualTrigger;
};

export const ChecklistItem: FC<Props> = (props) => {
  const { onNonManualButtonClick, toggleExpanded } = props;

  const handleToggleExpanded = useCallback(() => {
    toggleExpanded(props.index);
  }, [props.index, toggleExpanded]);

  const expandRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (expandRef.current) {
      expandRef.current.style.setProperty(
        "--flows-content-height",
        `${expandRef.current.scrollHeight}px`,
      );
    }
  }, []);

  const handleButtonClick = useCallback(() => {
    if (!getIsManualTrigger(props.completed)) {
      onNonManualButtonClick();
    }
  }, [onNonManualButtonClick, props.completed]);

  const handlePrimaryButtonClick = useCallback(() => {
    // Complete the item if it's manual trigger only
    if (getIsManualTrigger(props.completed)) {
      props.completed.setValue(true);
    }
    handleButtonClick();
  }, [handleButtonClick, props.completed]);

  return (
    <div
      className="flows_basicsV2_floating_checklist_item"
      data-expanded={props.expanded ? "true" : "false"}
    >
      <button
        type="button"
        className="flows_basicsV2_floating_checklist_item_expand_button"
        onClick={handleToggleExpanded}
        data-expanded={props.expanded ? "true" : "false"}
      >
        <Indicator completed={props.completed.value} />
        <span
          className="flows_basicsV2_floating_checklist_item_title"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(props.title, {
              FORCE_BODY: true,
              ADD_ATTR: ["target"],
            }),
          }}
        />
        <Chevron16
          className="flows_basicsV2_floating_checklist_item_chevron"
          data-expanded={props.expanded ? "true" : "false"}
          aria-hidden="true"
        />
      </button>
      <div
        className="flows_basicsV2_floating_checklist_item_content"
        ref={expandRef}
        data-expanded={props.expanded ? "true" : "false"}
      >
        <div className="flows_basicsV2_floating_checklist_item_content_inner">
          {props.description ? (
            <Text
              variant="body"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(props.description, {
                  FORCE_BODY: true,
                  ADD_ATTR: ["target"],
                }),
              }}
            />
          ) : null}
          {(props.primaryButton ?? props.secondaryButton) ? (
            <div className="flows_basicsV2_floating_checklist_item_buttons">
              {props.primaryButton ? (
                <ActionButton
                  onClick={handlePrimaryButtonClick}
                  action={props.primaryButton}
                  variant="primary"
                  size="small"
                />
              ) : null}
              {props.secondaryButton ? (
                <ActionButton
                  action={props.secondaryButton}
                  onClick={onNonManualButtonClick}
                  variant="secondary"
                  size="small"
                />
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
      <div className="flows_basicsV2_floating_checklist_item_indicator flows_basicsV2_floating_checklist_item_indicator_completed">
        <Check16 />
      </div>
    );
  }

  return <div className="flows_basicsV2_floating_checklist_item_indicator" />;
};
