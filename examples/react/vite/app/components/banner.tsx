import type { FC } from "react";

type Props = {
  title: string;
  body: string;

  close: () => void;
};

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
