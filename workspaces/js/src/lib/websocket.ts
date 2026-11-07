import { getReconnectDelay } from "@flows/shared";
import { wsError } from "../store";

interface Props {
  url: string;
  onMessage: (event: MessageEvent<unknown>) => void;
  onOpen: () => void;
}

export type Disconnect = () => void;

export const websocket = (props: Props): { disconnect: Disconnect } => {
  let reconnectAttempts = 0;
  let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
  let closeSocket: Disconnect | undefined;

  const connect = (): void => {
    const socket = new WebSocket(props.url);
    wsError.value = false;

    const handleOpen = (): void => {
      props.onOpen();
      reconnectAttempts = 0;
    };
    const handleClose = (): void => {
      reconnectAttempts += 1;
      reconnectTimeout = setTimeout(() => {
        connect();
      }, getReconnectDelay(reconnectAttempts));
    };
    const handleError = (): void => {
      wsError.value = true;
    };

    socket.addEventListener("message", props.onMessage);
    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", handleError);

    closeSocket = (): void => {
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
