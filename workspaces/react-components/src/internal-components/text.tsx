import { clsx } from "clsx";
import { type FC } from "react";

interface Props extends React.HTMLAttributes<HTMLParagraphElement> {
  variant: "title" | "body";
  as?: "legend" | "p";
}

export const Text: FC<Props> = ({ className, variant, as: Component = "p", ...props }) => {
  return (
    <Component
      className={clsx("flows_basicsV2_text", `flows_basicsV2_text_${variant}`, className)}
      {...props}
    />
  );
};
