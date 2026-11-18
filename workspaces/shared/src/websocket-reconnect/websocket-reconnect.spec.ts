import { afterEach, describe, expect, it, vi } from "vitest";
import { getReconnectDelay } from "./websocket-reconnect";

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
