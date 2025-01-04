interface Props {
  url: string;
  onMessage: (event: MessageEvent<unknown>) => void;
  onOpen: () => void;
}

export const websocket = (props: Props): void => {
  const connect = (): void => {
    const socket = new WebSocket(props.url);

    socket.addEventListener("message", props.onMessage);
    socket.addEventListener("open", props.onOpen);
    socket.addEventListener("close", () => {
      setTimeout(() => {
        connect();
      }, 2000);
    });
  };

  connect();
};
