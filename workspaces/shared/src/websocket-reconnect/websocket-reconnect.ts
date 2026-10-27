const MIN_RECONNECT_DELAY = 500;
const BASE_RECONNECT_DELAY = 10_000;
const MAX_RECONNECT_DELAY = 120_000;

/**
 * Exponential backoff with full jitter. The delay is random between 0.5s and a ceiling that doubles
 * with every failed attempt (10s, 20s, 40s, ...) up to 120s. The randomness spreads out reconnects
 * when many clients are disconnected at the same moment (proxy reload, server deploy).
 *
 * @param attempt - number of consecutive closes since the last successful connection, starting at 1
 */
export const getReconnectDelay = (attempt: number): number => {
  const ceiling = Math.min(
    BASE_RECONNECT_DELAY * 2 ** Math.max(attempt - 1, 0),
    MAX_RECONNECT_DELAY,
  );
  return MIN_RECONNECT_DELAY + Math.random() * (ceiling - MIN_RECONNECT_DELAY);
};
