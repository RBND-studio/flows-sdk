const MIN_RECONNECT_DELAY = 1000;
const BASE_RECONNECT_DELAY = 5_000;
const MAX_RECONNECT_DELAY = 120_000;

/**
 * How long a websocket has to stay open before the reconnect backoff resets. The server accepts the
 * connection before validating it and closes it right away when it's rejected (e.g. invalid
 * signature), so resetting on open would keep rejected clients reconnecting at the shortest delay.
 */
const STABLE_CONNECTION_DELAY = 10_000;

/**
 * Exponential backoff with full jitter. The delay is random between 1s and a ceiling that doubles
 * with every failed attempt (5s, 10s, 20s, ...) up to 120s. The randomness spreads out reconnects
 * when many clients are disconnected at the same moment (proxy reload, server deploy).
 *
 * @param attempt - number of consecutive closes since the last successful connection, starting at 1
 */
export const getReconnectDelay = (attempt: number): number => {
  const ceiling = Math.min(
    BASE_RECONNECT_DELAY * 2 ** Math.max(attempt - 1, 0),
    MAX_RECONNECT_DELAY,
  );
  return MIN_RECONNECT_DELAY + Math.random() * (ceiling - MIN_RECONNECT_DELAY);
};

export type Disconnect = () => void;

interface ConnectWebsocketOptions {
  url: string;
  onMessage: (event: MessageEvent<unknown>) => void;
  onOpen: () => void;
  onErrorChange: (error: boolean) => void;
}

/**
 * Opens a websocket that reconnects with `getReconnectDelay` backoff whenever it closes, until
 * `disconnect` is called.
 */
export const connectWebsocket = (props: ConnectWebsocketOptions): { disconnect: Disconnect } => {
  let reconnectAttempts = 0;
  let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
  let closeSocket: Disconnect | undefined;

  const connect = (): void => {
    const socket = new WebSocket(props.url);
    let stableTimeout: ReturnType<typeof setTimeout> | undefined;
    props.onErrorChange(false);

    const handleOpen = (): void => {
      props.onOpen();
      stableTimeout = setTimeout(() => {
        reconnectAttempts = 0;
      }, STABLE_CONNECTION_DELAY);
    };
    const handleClose = (): void => {
      clearTimeout(stableTimeout);
      reconnectAttempts += 1;
      reconnectTimeout = setTimeout(() => {
        connect();
      }, getReconnectDelay(reconnectAttempts));
    };
    const handleError = (): void => {
      props.onErrorChange(true);
    };

    socket.addEventListener("message", props.onMessage);
    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", handleError);

    closeSocket = (): void => {
      clearTimeout(stableTimeout);
      socket.removeEventListener("message", props.onMessage);
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("error", handleError);

      if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener("open", () => {
          socket.close();
        });
      } else socket.close();
    };
  };

  connect();

  const disconnect = (): void => {
    clearTimeout(reconnectTimeout);
    closeSocket?.();
  };

  return { disconnect };
};
