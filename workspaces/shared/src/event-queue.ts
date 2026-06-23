import type { ApiContext } from "./api";
import { getApi, type EventRequest } from "./api";
import { log } from "./log";
import type { CustomFetch } from "./types";

const LOCAL_STORAGE_KEY = "flows-events-queue";

type EventQueueItem = {
  id: string;
  event: EventRequest;
  apiContext: Omit<ApiContext, "customFetch">;
};

type EnqueueEventProps = Omit<EventQueueItem, "id"> & {
  customFetch?: CustomFetch;
};

export const enqueueEvent = ({
  customFetch,
  ...serializableData
}: EnqueueEventProps): Promise<void> => {
  const eventWithId: EventQueueItem = {
    id: crypto.randomUUID(),
    ...serializableData,
  };

  addToLocalStorageQueue(eventWithId);

  return sendEvents(customFetch);
};

let isSending = false;
let hasPendingRun = false;
let retryInterval: ReturnType<typeof setInterval> | undefined;

const RETRY_INTERVAL_MS = 10_000;

/**
 * This function is called automatically when sendEvent is called
 * It is also called on init after the blocks are fetched to send pending messages from previous page load
 */
export const sendEvents = async (customFetch?: CustomFetch): Promise<void> => {
  if (isSending) {
    hasPendingRun = true;
    return;
  }

  isSending = true;

  try {
    const queue = getLocalStorageQueue();

    for (const item of queue) {
      await getApi({ ...item.apiContext, customFetch })
        .sendEvent(item.event)
        .then(() => {
          removeFromLocalStorageQueue(item.id);
        })
        .catch((err) => {
          log.error("Failed to send event, will retry later", err);
        });
    }
  } finally {
    isSending = false;

    if (hasPendingRun) {
      hasPendingRun = false;
      void sendEvents(customFetch);
    } else {
      if (getLocalStorageQueue().length > 0) {
        if (retryInterval === undefined) {
          retryInterval = setInterval(() => {
            void sendEvents(customFetch);
          }, RETRY_INTERVAL_MS);
        }
      } else {
        clearInterval(retryInterval);
        retryInterval = undefined;
      }
    }
  }
};

const removeFromLocalStorageQueue = (id: string): void => {
  setLocalStorageQueue((previousValue) => previousValue.filter((item) => item.id !== id));
};

const addToLocalStorageQueue = (data: EventQueueItem): void => {
  setLocalStorageQueue((previousValue) => [...previousValue, data]);
};

const setLocalStorageQueue = (changeFn: (data: EventQueueItem[]) => EventQueueItem[]): void => {
  try {
    const previousValue = getLocalStorageQueue();
    const newValue = changeFn(previousValue);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newValue));
  } catch (err) {
    log.error("Failed to set event queue in local storage", err);
  }
};

const getLocalStorageQueue = (): EventQueueItem[] => {
  try {
    const stringResult = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stringResult) return [];
    const result = JSON.parse(stringResult) as EventQueueItem[];
    if (Array.isArray(result)) {
      return result;
    }
    return [];
  } catch (err) {
    log.error("Failed to get event queue from local storage", err);
    return [];
  }
};
