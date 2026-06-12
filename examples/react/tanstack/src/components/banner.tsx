import type { FC } from "react";
import { ComponentProps } from "@flows/react";

type Props = ComponentProps<{
  title: string;
  body: string;

  close: () => void;
}>;

export const Banner: FC<Props> = (props) => {
  return (
    <div>
      <p>{props.title}</p>
      <p>{props.body}</p>
      <div>
        <button onClick={props.close}>Close</button>
      </div>
    </div>
  );
};
