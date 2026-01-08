import { type FC } from "react";

interface Props {
  totalItems: number;
  completedItems: number;
}

export const ChecklistProgress: FC<Props> = (props) => {
  return (
    <div className="flows_basicsV2_checklist_progress">
      <p className="flows_basicsV2_checklist_progress_text">
        {props.completedItems} / {props.totalItems}
      </p>
      <div className="flows_basicsV2_checklist_progress_bar">
        <div
          className="flows_basicsV2_checklist_progress_bar_filled"
          style={{
            width: `${(props.completedItems / props.totalItems) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};
