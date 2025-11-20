import { clsx } from "clsx";
import { type FC } from "react";

interface Props extends React.HTMLAttributes<HTMLParagraphElement> {
  variant: "title" | "body";
}

export const Text: FC<Props> = ({ className, variant, ...props }) => {
  return (
    <p
      className={clsx("flows_basicsV2_text", `flows_basicsV2_text_${variant}`, className)}
      {...props}
    />
  );
};
