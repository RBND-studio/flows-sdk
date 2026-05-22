import { type FC } from "react";
import { getBlockRenderKey } from "@flows/shared";
import { useCurrentFloatingBlocks } from "../hooks/use-current-blocks";
import { Block } from "./block";

export const FloatingBlocks: FC = () => {
  const items = useCurrentFloatingBlocks();

  return (
    <>
      {items.map((item) => {
        return <Block key={getBlockRenderKey(item)} block={item} />;
      })}
    </>
  );
};
