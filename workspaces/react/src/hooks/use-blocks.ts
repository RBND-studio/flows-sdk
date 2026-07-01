import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CustomFetch } from "@flows/shared";
import {
  getApi,
  log,
  type UserProperties,
  type Block,
  type LanguageOption,
  getUserLanguage,
  applyUpdateMessageToBlocksState,
  logSlottableBlocksError,
  parseWebsocketMessage,
  type BlockUpdatesMessage,
  getClosedBlockStateIds,
  updateClosedBlockStateIds,
} from "@flows/shared";
import { packageAndVersion } from "../lib/constants";
import { type RemoveBlock, type UpdateBlock } from "../flows-context";
import { useWebsocket } from "./use-websocket";

interface Props {
  apiUrl: string;
  customFetch?: CustomFetch;
  environment: string;
  organizationId: string;
  userId: string;
  userProperties?: UserProperties;
  language?: LanguageOption;
  onAfterLoad: () => void;
}

interface Return {
  blocks: Block[] | null;
  freeOrg: boolean;
  removeBlock: RemoveBlock;
  updateBlock: UpdateBlock;
  error: boolean;
  wsError: boolean;
}

export const useBlocks = ({
  apiUrl,
  customFetch,
  environment,
  organizationId,
  userId,
  userProperties,
  language,
  onAfterLoad,
}: Props): Return => {
  const [blocksState, setBlocksState] = useState<Block[] | null>(null);
  const blocksStateRef = useRef(blocksState);
  blocksStateRef.current = blocksState;
  const [error, setError] = useState(false);

  const [closedBlockStateIds, setClosedBlockStateIds] = useState<string[] | null>(null);
  const addClosedBlockStateId = useCallback((blockStateId: string): void => {
    setClosedBlockStateIds((prev) => {
      const newValue = [...(prev ?? []), blockStateId];
      updateClosedBlockStateIds(newValue);
      return newValue;
    });
  }, []);
  const closedBlockStateIdsRef = useRef(closedBlockStateIds);
  closedBlockStateIdsRef.current = closedBlockStateIds;
  // Initialize closedBlockStateIds in browser from sessionStorage value
  useEffect(() => {
    if (closedBlockStateIdsRef.current) return;
    setClosedBlockStateIds(getClosedBlockStateIds());
  }, []);

  const blocks = useMemo(() => {
    const closedBlockStateIdsSet = new Set(closedBlockStateIds);

    if (!blocksState) return blocksState;
    return blocksState?.filter((b) => {
      if (!b.blockStateId) return true;
      return !closedBlockStateIdsSet.has(b.blockStateId);
    });
  }, [blocksState, closedBlockStateIds]);

  const [usageLimited, setUsageLimited] = useState(false);
  const [freeOrg, setFreeOrg] = useState(false);
  const pendingMessages = useRef<BlockUpdatesMessage[]>([]);

  const params = useMemo(
    () => ({ environment, organizationId, userId }),
    [environment, organizationId, userId],
  );

  const userPropertiesStateRef = useRef(userProperties);
  userPropertiesStateRef.current = userProperties;

  const activeFetchRef = useRef<Promise<void> | null>(null);
  const queuedFetchRef = useRef(false);
  const fetchBlocks = useCallback(() => {
    if (activeFetchRef.current) {
      queuedFetchRef.current = true;
      return;
    }

    setError(false);
    activeFetchRef.current = getApi({ apiUrl, version: packageAndVersion, customFetch })
      .getBlocks({
        ...params,
        language: getUserLanguage(language),
        userProperties: userPropertiesStateRef.current,
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
        if (res.meta?.free_org) setFreeOrg(true);
        onAfterLoad();
      })
      .catch((err: unknown) => {
        setError(true);
        log.error("Failed to load blocks", err);
      })
      .finally(() => {
        activeFetchRef.current = null;
        if (!queuedFetchRef.current) return;
        queuedFetchRef.current = false;
        fetchBlocks();
      });
  }, [apiUrl, language, params, customFetch, onAfterLoad]);

  // Refetch blocks when userProperties change
  const fetchBlocksRef = useRef(fetchBlocks);
  fetchBlocksRef.current = fetchBlocks;
  const firstRenderRef = useRef(true);
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    fetchBlocksRef.current();
  }, [userProperties]);

  const websocketUrl = useMemo(() => {
    if (usageLimited) return;
    const baseUrl = apiUrl.replace("https://", "wss://").replace("http://", "ws://");
    return `${baseUrl}/ws/sdk/block-updates?${new URLSearchParams(params).toString()}`;
  }, [apiUrl, params, usageLimited]);

  const onMessage = useCallback((event: MessageEvent<unknown>) => {
    const data = parseWebsocketMessage(event);
    if (!data) return;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- there will be more message types in the future
    if (data.type === "block-updates") {
      setBlocksState((prev) => {
        if (!prev) {
          pendingMessages.current.push(data);
          return prev;
        }
        return applyUpdateMessageToBlocksState(prev, data);
      });
    }
  }, []);
  const { error: wsError } = useWebsocket({ url: websocketUrl, onMessage, onOpen: fetchBlocks });

  // Log error about slottable blocks without slotId
  useEffect(() => {
    logSlottableBlocksError(blocks ?? []);
  }, [blocks]);

  const removeBlock: RemoveBlock = useCallback(
    (blockId) => {
      const removedBlock = blocksStateRef.current?.find((b) => b.id === blockId);
      setBlocksState((prev) => {
        if (!prev) return prev;
        return prev.filter((b) => b.id !== blockId);
      });
      if (removedBlock?.blockStateId) addClosedBlockStateId(removedBlock.blockStateId);
    },
    [addClosedBlockStateId],
  );
  const updateBlock: UpdateBlock = useCallback((blockId, updateFn) => {
    setBlocksState((prev) => {
      if (!prev) return prev;
      return prev.map((b) => (b.id === blockId ? updateFn(b) : b));
    });
  }, []);

  return { blocks, freeOrg, error, wsError, removeBlock, updateBlock };
};
