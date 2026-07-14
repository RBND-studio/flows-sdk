import type { FC } from "react";
import type { TourComponentProps } from "@flows/react";

type Props = TourComponentProps<{
  title: string;
  body: string;
}>;

export const TourBanner: FC<Props> = (props) => {
  return (
    <div>
      <p>{props.title}</p>
      <p>{props.body}</p>
      <div>
        {/* In the first step the previous function is undefined */}
        {props.previous && <button onClick={props.previous}>Previous</button>}
        <button onClick={props.continue}>Continue</button>
        <button onClick={props.cancel}>Cancel</button>
      </div>
    </div>
  );
};
