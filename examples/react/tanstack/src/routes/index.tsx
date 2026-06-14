import { FlowsSlot } from "@flows/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>

      <FlowsSlot
        id="my-slot"
        placeholder={
          <div>
            <p>Slot content will be displayed here</p>
          </div>
        }
      />
    </div>
  );
}
