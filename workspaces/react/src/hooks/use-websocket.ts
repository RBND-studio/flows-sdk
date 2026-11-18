import { useEffect, useRef, useState } from "react";
import { connectWebsocket } from "@flows/shared";

interface Props {
  url?: string;
  onMessage: (event: MessageEvent<unknown>) => void;
  onOpen?: () => void;
}

interface Return {
  error: boolean;
}

export const useWebsocket = ({ url, onMessage, onOpen }: Props): Return => {
  const [error, setError] = useState(false);

  const onOpenRef = useRef(onOpen);
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!url) return;

    const { disconnect } = connectWebsocket({
      url,
      onMessage: (event) => {
        onMessageRef.current(event);
      },
      onOpen: () => {
        onOpenRef.current?.();
      },
      onErrorChange: setError,
    });
    return disconnect;
  }, [url]);

  return { error };
};
