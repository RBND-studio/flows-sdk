import { TourComponentProps } from "@flows/js";
import { Component } from "solid-js";

type Props = TourComponentProps<{
  title: string;
  body: string;
}>;

export const TourBanner: Component<Props> = (props) => {
  return (
    <div>
      <h2>{props.title}</h2>
      <p>{props.body}</p>

      {/* In the first step the previous function is undefined */}
      {!!props.previous && <button onClick={props.previous}>Previous</button>}
      <button onClick={props.continue}>Continue</button>
      <button onClick={props.cancel}>Cancel</button>
    </div>
  );
};
