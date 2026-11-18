// cspell:words unstub
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectWebsocket, type Disconnect, getReconnectDelay } from "./websocket-reconnect";

const mockRandom = (value: number): void => {
  vi.spyOn(Math, "random").mockReturnValue(value);
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getReconnectDelay", () => {
  it("should wait at least 1s", () => {
    mockRandom(0);
    expect(getReconnectDelay(1)).toBe(1000);
    expect(getReconnectDelay(5)).toBe(1000);
  });
  it("should wait at most 10s on the first attempt", () => {
    mockRandom(1);
    expect(getReconnectDelay(1)).toBe(10_000);
  });
  it("should pick a random delay between the bounds", () => {
    mockRandom(0.5);
    expect(getReconnectDelay(1)).toBe(5500);
  });
  it("should double the maximum delay with every attempt", () => {
    mockRandom(1);
    expect(getReconnectDelay(2)).toBe(20_000);
    expect(getReconnectDelay(3)).toBe(40_000);
    expect(getReconnectDelay(4)).toBe(80_000);
  });
  it("should cap the delay at 120s", () => {
    mockRandom(1);
    expect(getReconnectDelay(5)).toBe(120_000);
    expect(getReconnectDelay(50)).toBe(120_000);
    expect(getReconnectDelay(5000)).toBe(120_000);
  });
  it("should treat attempt 0 as the first attempt", () => {
    mockRandom(1);
    expect(getReconnectDelay(0)).toBe(10_000);
  });
  it("should return different delays for different random values", () => {
    const delays = new Set(Array.from({ length: 100 }, () => getReconnectDelay(1)));
    expect(delays.size).toBeGreaterThan(1);
    delays.forEach((delay) => {
      expect(delay).toBeGreaterThanOrEqual(1000);
      expect(delay).toBeLessThanOrEqual(10_000);
    });
  });
});

class FakeWebSocket extends EventTarget {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 3;
  static instances: FakeWebSocket[] = [];

  readyState = FakeWebSocket.CONNECTING;
  url: string;

  constructor(url: string) {
    super();
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  close(): void {
    this.readyState = FakeWebSocket.CLOSED;
  }

  serverOpen(): void {
    this.readyState = FakeWebSocket.OPEN;
    this.dispatchEvent(new Event("open"));
  }

  serverError(): void {
    this.dispatchEvent(new Event("error"));
  }

  serverClose(): void {
    this.readyState = FakeWebSocket.CLOSED;
    this.dispatchEvent(new Event("close"));
  }
}

const getSocket = (index: number): FakeWebSocket => {
  const socket = FakeWebSocket.instances[index];
  if (!socket) throw new Error(`Socket ${index} was not created`);
  return socket;
};

const connect = (
  url = "wss://test",
): {
  disconnect: Disconnect;
  onOpen: () => void;
  onErrorChange: (error: boolean) => void;
} => {
  const onOpen = vi.fn<() => void>();
  const onMessage = vi.fn<(event: MessageEvent<unknown>) => void>();
  const onErrorChange = vi.fn<(error: boolean) => void>();
  const { disconnect } = connectWebsocket({ url, onMessage, onOpen, onErrorChange });
  return { disconnect, onOpen, onErrorChange };
};

describe("connectWebsocket", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
    vi.stubGlobal("WebSocket", FakeWebSocket);
    // Always wait the longest possible delay
    mockRandom(1);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should call onOpen when the connection opens", () => {
    const { onOpen } = connect();
    getSocket(0).serverOpen();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
  it("should report errors and clear them on reconnect", () => {
    const { onErrorChange } = connect();
    expect(onErrorChange).toHaveBeenLastCalledWith(false);
    getSocket(0).serverError();
    getSocket(0).serverClose();
    expect(onErrorChange).toHaveBeenLastCalledWith(true);
    vi.advanceTimersByTime(10_000);
    expect(onErrorChange).toHaveBeenLastCalledWith(false);
  });
  it("should reconnect with backoff after the connection closes", () => {
    connect();
    getSocket(0).serverClose();
    vi.advanceTimersByTime(9_999);
    expect(FakeWebSocket.instances).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(FakeWebSocket.instances).toHaveLength(2);

    getSocket(1).serverClose();
    vi.advanceTimersByTime(19_999);
    expect(FakeWebSocket.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeWebSocket.instances).toHaveLength(3);
  });
  it("should keep backing off when the server closes the connection right after opening it", () => {
    connect();
    getSocket(0).serverOpen();
    getSocket(0).serverClose();
    vi.advanceTimersByTime(10_000);
    expect(FakeWebSocket.instances).toHaveLength(2);

    getSocket(1).serverOpen();
    getSocket(1).serverClose();
    vi.advanceTimersByTime(19_999);
    expect(FakeWebSocket.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeWebSocket.instances).toHaveLength(3);
  });
  it("should reset the backoff after the connection stays open", () => {
    connect();
    getSocket(0).serverClose();
    vi.advanceTimersByTime(10_000);

    getSocket(1).serverOpen();
    vi.advanceTimersByTime(10_000);
    getSocket(1).serverClose();
    vi.advanceTimersByTime(10_000);
    expect(FakeWebSocket.instances).toHaveLength(3);
  });
  it("should close the current socket and stop reconnecting on disconnect", () => {
    const { disconnect } = connect();
    getSocket(0).serverOpen();
    getSocket(0).serverClose();
    vi.advanceTimersByTime(10_000);
    getSocket(1).serverOpen();

    disconnect();
    expect(getSocket(1).readyState).toBe(FakeWebSocket.CLOSED);
    vi.advanceTimersByTime(200_000);
    expect(FakeWebSocket.instances).toHaveLength(2);
  });
  it("should cancel a pending reconnect on disconnect", () => {
    const { disconnect } = connect();
    getSocket(0).serverClose();
    disconnect();
    vi.advanceTimersByTime(200_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });
  it("should close a connecting socket once it opens on disconnect", () => {
    const { disconnect, onOpen } = connect();
    disconnect();
    getSocket(0).serverOpen();
    expect(getSocket(0).readyState).toBe(FakeWebSocket.CLOSED);
    expect(onOpen).not.toHaveBeenCalled();
  });
  it("should track reconnect attempts per connection", () => {
    const first = connect("wss://first");
    getSocket(0).serverClose();
    vi.advanceTimersByTime(10_000);
    getSocket(1).serverClose();
    first.disconnect();

    connect("wss://second");
    getSocket(2).serverClose();
    vi.advanceTimersByTime(10_000);
    expect(FakeWebSocket.instances).toHaveLength(4);
    expect(getSocket(3).url).toBe("wss://second");
  });
});
