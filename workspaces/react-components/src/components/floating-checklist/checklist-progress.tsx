import { type FC } from "react";
import { Progress } from "../../internal-components/progress";

interface Props {
  totalItems: number;
  completedItems: number;
}

export const ChecklistProgress: FC<Props> = (props) => {
  return (
    <div className="flows_basicsV2_floating_checklist_progress">
      <p className="flows_basicsV2_floating_checklist_progress_text">
        {props.completedItems} / {props.totalItems}
      </p>
      <Progress max={props.totalItems} value={props.completedItems} />
    </div>
  );
};
