import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  url: string;
  onMessage: (event: MessageEvent<unknown>) => void;
  onOpen?: () => void;
}

export const useWebsocket = ({ url, onMessage, onOpen }: Props): void => {
  const [ws, setWs] = useState<WebSocket>();
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const onOpenRef = useRef(onOpen);
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  const handleMessage = useCallback((event: MessageEvent<unknown>) => {
    onMessageRef.current(event);
  }, []);

  const connect = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = undefined;
    }

    const socket = new WebSocket(url);
    setWs(socket);

    const handleOpen = (): void => {
      onOpenRef.current?.();
      setReconnectAttempts(0);
    };
    const handleClose = (): void => {
      setWs(undefined);
      setReconnectAttempts((p) => p + 1);
    };
    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("message", handleMessage);

    const cleanup = (): void => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("message", handleMessage);

      if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener("open", () => {
          socket.close();
        });
      } else socket.close();

      setWs(undefined);
    };

    cleanupRef.current = cleanup;
    return cleanup;
  }, [handleMessage, url]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup();
    };
  }, [connect]);

  useEffect(() => {
    if (ws) return;

    const timeout = setTimeout(
      () => {
        connect();
      },
      Math.min(1000 * 2 ** reconnectAttempts, 10000),
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [reconnectAttempts, ws, connect]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);
};
