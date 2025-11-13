import classNames from "classnames";
import { type FC, useMemo } from "react";

interface Props {
  count: number;
  index: number;
}

export const Dots: FC<Props> = ({ count, index }) => {
  const dots = useMemo(
    () =>
      Array(count)
        .fill(null)
        .map((_, i) => i),
    [count],
  );

  return (
    <div className="flows_basicsV2_dots">
      {dots.map((item) => (
        <div
          key={item}
          className={classNames(
            "flows_basicsV2_dots_dot",
            item === index && "flows_basicsV2_dots_dot_active",
          )}
        />
      ))}
    </div>
  );
};
