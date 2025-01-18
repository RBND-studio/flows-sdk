import classNames from "classnames";
import { type FC } from "react";

interface Props extends React.HTMLAttributes<HTMLParagraphElement> {
  variant: "title" | "body";
}

export const Text: FC<Props> = ({ className, variant, ...props }) => {
  return <p className={classNames("flows_text", `flows_text_${variant}`, className)} {...props} />;
};
