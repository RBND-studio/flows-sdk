import { wsError } from "../store";

interface Props {
  url: string;
  onMessage: (event: MessageEvent<unknown>) => void;
  onOpen: () => void;
}

export type Disconnect = () => void;

let reconnectAttempts = 0;

export const websocket = (props: Props): { disconnect: Disconnect } => {
  const connect = (): { disconnect: Disconnect } => {
    const socket = new WebSocket(props.url);
    wsError.value = false;

    const handleOpen = (): void => {
      props.onOpen();
      reconnectAttempts = 0;
    };
    const handleClose = (): void => {
      setTimeout(
        () => {
          connect();
        },
        Math.min(1000 * 4 ** reconnectAttempts, 120_000),
      );
      reconnectAttempts += 1;
    };
    const handleError = (): void => {
      wsError.value = true;
    };

    socket.addEventListener("message", props.onMessage);
    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", handleError);

    const disconnect = (): void => {
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

    return { disconnect };
  };

  return connect();
};
