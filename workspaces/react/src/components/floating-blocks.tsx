import { type FC } from "react";
import { useCurrentFloatingBlocks } from "../hooks/use-current-blocks";
import { Block } from "./block";
import { TourBlock } from "./tour-block";

export const FloatingBlocks: FC = () => {
  const items = useCurrentFloatingBlocks();

  return (
    <>
      {items.map((item) => {
        if (item.type === "component") return <Block key={item.id} block={item} />;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it's better to be safe
        if (item.type === "tour-component") return <TourBlock key={item.id} block={item} />;
        return null;
      })}
    </>
  );
};
