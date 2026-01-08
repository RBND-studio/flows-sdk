import { Title } from "@solidjs/meta";
import Counter from "~/components/Counter";

export default function Home() {
  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
      <Counter />
      <p>
        Visit{" "}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>

      {/*  Flows Slot with optional placeholder */}
      <flows-slot data-slot-id="my-slot">
        <div data-placeholder>
          <h2>Placeholder</h2>
          <p>This is a placeholder for the slot</p>
        </div>
      </flows-slot>
    </main>
  );
}
