import { ComponentProps } from "@flows/js";
import { Component } from "solid-js";

type Props = ComponentProps<{
  title: string;
  body: string;

  close: () => void;
}>;

export const Banner: Component<Props> = (props) => {
  return (
    <div>
      <h2>{props.title}</h2>
      <p>{props.body}</p>

      <button onClick={props.close}>Close</button>
    </div>
  );
};
