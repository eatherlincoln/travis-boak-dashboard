import { useEffect, useState } from "react";

const REFRESH_EVENT = "app:data-updated";

export function notifyDataUpdated() {
  window.dispatchEvent(new Event(REFRESH_EVENT));
}

export function useRefreshSignal() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener(REFRESH_EVENT, h);
    return () => window.removeEventListener(REFRESH_EVENT, h);
  }, []);
  return { tick };
}

// Alias kept for backwards compatibility
export const useAutoRefresh = useRefreshSignal;
