import { useCallback, useEffect, useState } from "react";

let listeners: Array<() => void> = [];

export function useRefreshSignal() {
  const [tick, setTick] = useState(0);

  const notify = useCallback(() => {
    listeners.forEach((fn) => fn());
  }, []);

  const subscribe = useCallback((fn: () => void) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((f) => f !== fn);
    };
  }, []);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, [subscribe]);

  return { tick, notify };
}
