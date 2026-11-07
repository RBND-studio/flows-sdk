import { getReconnectDelay } from "./websocket-reconnect";

const mockRandom = (value: number): void => {
  jest.spyOn(Math, "random").mockReturnValue(value);
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe("getReconnectDelay", () => {
  it("should wait at least 0.5s", () => {
    mockRandom(0);
    expect(getReconnectDelay(1)).toBe(500);
    expect(getReconnectDelay(5)).toBe(500);
  });
  it("should wait at most 10s on the first attempt", () => {
    mockRandom(1);
    expect(getReconnectDelay(1)).toBe(10_000);
  });
  it("should pick a random delay between the bounds", () => {
    mockRandom(0.5);
    expect(getReconnectDelay(1)).toBe(5250);
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
      expect(delay).toBeGreaterThanOrEqual(500);
      expect(delay).toBeLessThanOrEqual(10_000);
    });
  });
});
