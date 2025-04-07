interface Props {
  url: string;
  onMessage: (event: MessageEvent<unknown>) => void;
  onOpen: () => void;
}

export type Disconnect = () => void;

// TODO: implement better automatic reconnection
export const websocket = (props: Props): { disconnect: Disconnect } => {
  const connect = (): { disconnect: Disconnect } => {
    const socket = new WebSocket(props.url);

    const handleClose = (): void => {
      setTimeout(() => {
        connect();
      }, 2000);
    };

    socket.addEventListener("message", props.onMessage);
    socket.addEventListener("open", props.onOpen);
    socket.addEventListener("close", handleClose);

    const disconnect = (): void => {
      socket.removeEventListener("message", props.onMessage);
      socket.removeEventListener("open", props.onOpen);
      socket.removeEventListener("close", handleClose);

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
