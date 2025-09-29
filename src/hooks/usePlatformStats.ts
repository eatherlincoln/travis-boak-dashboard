// src/hooks/usePlatformStats.ts
import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "./useAutoRefresh";

export type Platform = "instagram" | "youtube" | "tiktok";
export type PlatformStats = {
  platform: Platform;
  followers: number | null;
  monthly_views: number | null;
  engagement: number | null; // percent
  updated_at?: string | null;
};

export function usePlatformStats(platform: Platform) {
  const { version } = useRefreshSignal();
  const [row, setRow] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_stats")
        .select("*")
        .eq("platform", platform)
        .maybeSingle();

      if (!alive) return;
      setRow(error ? null : (data as PlatformStats | null));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [platform, version]);

  return { row, loading };
}
