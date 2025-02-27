import { type FC, type ReactNode } from "react";
import { useCurrentSlotBlocks } from "../hooks/use-current-blocks";
import { Block } from "./block";
import { TourBlock } from "./tour-block";

export interface FlowsSlotProps {
  id: string;
  placeholder?: ReactNode;
}

export const FlowsSlot: FC<FlowsSlotProps> = ({ id, placeholder }) => {
  const items = useCurrentSlotBlocks(id);

  if (items.length)
    return items.map((item) => {
      if (item.type === "component") return <Block key={item.id} block={item} />;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it's better to be safe
      if (item.type === "tour-component") return <TourBlock key={item.id} block={item} />;
      return null;
    });

  return placeholder ?? null;
};
