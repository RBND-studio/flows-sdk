import { FlowsSlot } from "@flows/react";
import { FC } from "react";

export const HomePage: FC = () => {
  return (
    <>
      <h1>Welcome to home page!</h1>

      <FlowsSlot
        id="my-slot"
        placeholder={
          <div>
            <p>Slot content will be displayed here</p>
          </div>
        }
      />
    </>
  );
};
