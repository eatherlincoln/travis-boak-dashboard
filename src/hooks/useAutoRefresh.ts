// src/hooks/useAutoRefresh.ts
import { useCallback, useEffect, useState } from "react";

type Listener = () => void;

// Module-scoped listener set
const listeners = new Set<Listener>();

/** Call this if you ever need to trigger a refresh outside React. */
export function bumpGlobalRefresh() {
  listeners.forEach((fn) => fn());
}

/**
 * Lightweight pub/sub refresh signal.
 * - `tick` increments whenever someone calls `bump()`
 * - Any hook that depends on `tick` will re-run its effect
 */
export function useRefreshSignal() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const cb = () => setTick((t) => t + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const bump = useCallback(() => {
    listeners.forEach((fn) => fn());
  }, []);

  return { tick, bump };
}

/** Back-compat alias (in case anything still imports useAutoRefresh) */
export function useAutoRefresh() {
  return useRefreshSignal();
}
