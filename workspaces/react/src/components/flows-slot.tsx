import { type FC, type ReactNode } from "react";
import { getBlockRenderKey } from "@flows/shared";
import { useCurrentSlotBlocks } from "../hooks/use-current-blocks";
import { Block } from "./block";

export interface FlowsSlotProps {
  id: string;
  placeholder?: ReactNode;
}

export const FlowsSlot: FC<FlowsSlotProps> = ({ id, placeholder }) => {
  const items = useCurrentSlotBlocks(id);

  if (items.length)
    return items.map((item) => {
      return <Block key={getBlockRenderKey(item)} block={item} />;
    });

  return placeholder ?? null;
};
