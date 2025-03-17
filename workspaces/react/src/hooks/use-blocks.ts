import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getApi,
  log,
  type UserProperties,
  type Block,
  type TourStep,
  type BlockUpdatesPayload,
} from "@flows/shared";
import { packageAndVersion } from "../lib/constants";
import { type RemoveBlock, type UpdateBlock } from "../flows-context";
import { useWebsocket } from "./use-websocket";

interface Props {
  apiUrl: string;
  environment: string;
  organizationId: string;
  userId: string;
  userProperties?: UserProperties;
}

interface Return {
  blocks: Block[];
  removeBlock: RemoveBlock;
  updateBlock: UpdateBlock;
}

export const useBlocks = ({
  apiUrl,
  environment,
  organizationId,
  userId,
  userProperties,
}: Props): Return => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const params = useMemo(
    () => ({ environment, organizationId, userId }),
    [environment, organizationId, userId],
  );
  const userPropertiesRef = useRef(userProperties);
  useEffect(() => {
    userPropertiesRef.current = userProperties;
  }, [userProperties]);

  // TODO: call fetchBlocks on reconnect
  const fetchBlocks = useCallback(() => {
    void getApi(apiUrl, packageAndVersion)
      .getBlocks({ ...params, userProperties: userPropertiesRef.current })
      .then((res) => {
        setBlocks(res.blocks);
      })
      .catch((err: unknown) => {
        log.error("Failed to load blocks", err);
      });
  }, [apiUrl, params]);

  const url = useMemo(() => {
    const baseUrl = apiUrl.replace("https://", "wss://").replace("http://", "ws://");
    return `${baseUrl}/ws/sdk/block-updates?${new URLSearchParams(params).toString()}`;
  }, [apiUrl, params]);

  const onMessage = useCallback((event: MessageEvent<unknown>) => {
    // TODO: add debug logging
    // console.log("Message from server", event.data);
    const data = JSON.parse(event.data as string) as BlockUpdatesPayload;
    const exitedOrUpdatedBlockIdsSet = new Set([
      ...data.exitedBlockIds,
      ...data.updatedBlocks.map((b) => b.id),
    ]);
    setBlocks((prevBlocks) => [
      ...prevBlocks.filter((block) => !exitedOrUpdatedBlockIdsSet.has(block.id)),
      ...data.updatedBlocks,
    ]);
  }, []);
  useWebsocket({ url, onMessage, onOpen: fetchBlocks });

  // Log error about slottable blocks without slotId
  useEffect(() => {
    blocks.forEach((b) => {
      logSlottableError(b);

      b.tourBlocks?.forEach((tb) => {
        logSlottableError(tb);
      });
    });
  }, [blocks]);

  const removeBlock: RemoveBlock = useCallback((blockId) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }, []);
  const updateBlock: UpdateBlock = useCallback((blockId, updateFn) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? updateFn(b) : b)));
  }, []);

  return { blocks, removeBlock, updateBlock };
};

const logSlottableError = (b: Block | TourStep): void => {
  if (b.slottable && !b.slotId)
    log.error(
      `Encountered workflow block "${b.componentType}" that is slottable but has no slotId`,
    );
};
