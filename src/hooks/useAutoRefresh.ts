// src/hooks/useAutoRefresh.ts
import { useCallback, useRef, useSyncExternalStore } from "react";

/** Tiny global tick store to notify listeners (hooks) to refetch */
let _version = 0;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return _version;
}

/** Call this in components that should refetch when admin saves */
export function useRefreshSignal() {
  const v = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const tick = useCallback(() => {
    _version++;
    for (const l of listeners) l();
  }, []);
  return { tick, version: v };
}

/** Convenience: auto refetch on a timer (optional) */
export function useAutoRefresh(ms = 0) {
  const id = useRef<number | null>(null);
  const { tick } = useRefreshSignal();
  return {
    start() {
      if (ms > 0 && id.current == null) {
        id.current = window.setInterval(tick, ms);
      }
    },
    stop() {
      if (id.current != null) {
        clearInterval(id.current);
        id.current = null;
      }
    },
  };
}
