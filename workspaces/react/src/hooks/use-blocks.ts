import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getApi,
  log,
  type UserProperties,
  type Block,
  type BlockUpdatesPayload,
  type LanguageOption,
  getUserLanguage,
  applyUpdateMessageToBlocksState,
  logSlottableBlocksError,
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
  language?: LanguageOption;
}

interface Return {
  blocks: Block[];
  removeBlock: RemoveBlock;
  updateBlock: UpdateBlock;
  error: boolean;
  wsError: boolean;
}

export const useBlocks = ({
  apiUrl,
  environment,
  organizationId,
  userId,
  userProperties,
  language,
}: Props): Return => {
  const [blocksState, setBlocksState] = useState<Block[] | null>(null);
  const [error, setError] = useState(false);
  const blocks = useMemo(() => blocksState ?? [], [blocksState]);

  const [usageLimited, setUsageLimited] = useState(false);
  const pendingMessages = useRef<BlockUpdatesPayload[]>([]);

  const params = useMemo(
    () => ({ environment, organizationId, userId }),
    [environment, organizationId, userId],
  );
  const userPropertiesRef = useRef(userProperties);
  useEffect(() => {
    userPropertiesRef.current = userProperties;
  }, [userProperties]);

  const fetchBlocks = useCallback(() => {
    setError(false);
    void getApi(apiUrl, packageAndVersion)
      .getBlocks({
        ...params,
        language: getUserLanguage(language),
        userProperties: userPropertiesRef.current,
      })
      .then((res) => {
        setBlocksState(pendingMessages.current.reduce(applyUpdateMessageToBlocksState, res.blocks));
        pendingMessages.current.length = 0;
        setTimeout(() => {
          if (pendingMessages.current.length) {
            const pendingMessagesCurrent = [...pendingMessages.current];
            pendingMessages.current.length = 0;
            setBlocksState((prev) =>
              pendingMessagesCurrent.reduce(applyUpdateMessageToBlocksState, prev ?? []),
            );
          }
        }, 0);

        if (res.meta?.usage_limited) setUsageLimited(true);
      })
      .catch((err: unknown) => {
        setError(true);
        log.error("Failed to load blocks", err);
      });
  }, [apiUrl, language, params]);

  const websocketUrl = useMemo(() => {
    if (usageLimited) return;
    const baseUrl = apiUrl.replace("https://", "wss://").replace("http://", "ws://");
    return `${baseUrl}/ws/sdk/block-updates?${new URLSearchParams(params).toString()}`;
  }, [apiUrl, params, usageLimited]);

  const onMessage = useCallback((event: MessageEvent<unknown>) => {
    // TODO: add debug logging
    // console.log("Message from server", event.data);
    const data = JSON.parse(event.data as string) as BlockUpdatesPayload;
    setBlocksState((prev) => {
      if (!prev) {
        pendingMessages.current.push(data);
        return prev;
      }
      return applyUpdateMessageToBlocksState(prev, data);
    });
  }, []);
  const { error: wsError } = useWebsocket({ url: websocketUrl, onMessage, onOpen: fetchBlocks });

  // Log error about slottable blocks without slotId
  useEffect(() => {
    logSlottableBlocksError(blocks);
  }, [blocks]);

  const removeBlock: RemoveBlock = useCallback((blockId) => {
    setBlocksState((prev) => {
      if (!prev) return prev;
      return prev.filter((b) => b.id !== blockId);
    });
  }, []);
  const updateBlock: UpdateBlock = useCallback((blockId, updateFn) => {
    setBlocksState((prev) => {
      if (!prev) return prev;
      return prev.map((b) => (b.id === blockId ? updateFn(b) : b));
    });
  }, []);

  return { blocks, error, wsError, removeBlock, updateBlock };
};
