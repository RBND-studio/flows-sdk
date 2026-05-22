import { useMemo, type FC, type ReactNode } from "react";
import { getBlockRenderKey } from "@flows/shared";
import { useCurrentSlotBlocks } from "../hooks/use-current-blocks";
import { Block } from "./block";

export interface FlowsSlotProps {
  id: string;
  placeholder?: ReactNode;
  /**
   * Limit of how many blocks to render in this slot. Defaults to no limit.
   *
   * Useful when multiple blocks match the same slot.
   *
   * @default undefined
   */
  limit?: number;
}

export const FlowsSlot: FC<FlowsSlotProps> = ({ id, placeholder, limit }) => {
  const blocks = useCurrentSlotBlocks(id);

  const blocksToRender = useMemo(
    () => (limit === undefined ? blocks : blocks.slice(0, limit)),
    [blocks, limit],
  );

  if (blocksToRender.length)
    return blocksToRender.map((item) => {
      return <Block key={getBlockRenderKey(item)} block={item} />;
    });

  return placeholder ?? null;
};
