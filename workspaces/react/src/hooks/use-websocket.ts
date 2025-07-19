import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  url?: string;
  onMessage: (event: MessageEvent<unknown>) => void;
  onOpen?: () => void;
}

interface Return {
  error: boolean;
}

export const useWebsocket = ({ url, onMessage, onOpen }: Props): Return => {
  const [ws, setWs] = useState<WebSocket>();
  const [error, setError] = useState(false);
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

  const connect = useCallback((): (() => void) | undefined => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = undefined;
    }

    if (!url) return;

    const socket = new WebSocket(url);
    setError(false);
    setWs(socket);

    const handleOpen = (): void => {
      onOpenRef.current?.();
      setReconnectAttempts(0);
    };
    const handleClose = (): void => {
      setWs(undefined);
      setReconnectAttempts((p) => p + 1);
    };
    const handleError = (): void => {
      setError(true);
    };
    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", handleError);
    socket.addEventListener("message", handleMessage);

    const cleanup = (): void => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("error", handleError);
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
      cleanup?.();
    };
  }, [connect]);

  useEffect(() => {
    if (ws) return;

    const timeout = setTimeout(
      () => {
        connect();
      },
      Math.min(1000 * 4 ** reconnectAttempts, 120_000),
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

  return { error };
};
