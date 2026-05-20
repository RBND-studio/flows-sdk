import { useMemo, type FC, type ReactNode } from "react";
import { getBlockRenderKey } from "@flows/shared";
import { useCurrentSlotBlocks } from "../hooks/use-current-blocks";
import { Block } from "./block";

export interface FlowsSlotProps {
  id: string;
  placeholder?: ReactNode;
  /**
   * Optional limit of how many blocks to render in this slot. If not provided, all blocks will be rendered.
   *
   * Useful when multiple blocks are matching the same slot.
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
