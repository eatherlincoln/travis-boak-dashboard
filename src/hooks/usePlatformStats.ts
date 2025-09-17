import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

type PlatformKey = "instagram" | "youtube" | "tiktok";
export type PlatformStats = {
  platform: PlatformKey;
  follower_count: number | null;
  monthly_views: number | null;
  engagement_rate?: number | null;
  additional_metrics?: Record<string, any>;
  updated_at?: string | null;
};

const DEFAULTS: Record<PlatformKey, PlatformStats> = {
  instagram: {
    platform: "instagram",
    follower_count: 38700,
    monthly_views: 730000,
    engagement_rate: 0.02,
  },
  youtube: {
    platform: "youtube",
    follower_count: 8800,
    monthly_views: 86800,
    engagement_rate: 0.018,
  },
  tiktok: {
    platform: "tiktok",
    follower_count: 1410,
    monthly_views: 37000,
    engagement_rate: 0.024,
  },
};

export function usePlatformStats() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<Record<string, PlatformStats>>({});
  const [error, setError] = useState<string>();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const { data, error } = await supabase
        .from("platform_stats")
        .select(
          "platform,follower_count,monthly_views,engagement_rate,additional_metrics,updated_at"
        );
      if (error) throw error;

      const map: Record<string, PlatformStats> = {};
      for (const r of data ?? []) map[r.platform] = r as PlatformStats;
      setRaw(map);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load stats");
      setRaw({});
      console.error("usePlatformStats error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, user?.id]);

  const getPlatformStat = useCallback(
    (key: PlatformKey) => {
      return { ...DEFAULTS[key], ...(raw[key] ?? {}) };
    },
    [raw]
  );

  return { loading, error, getPlatformStat, refetch: fetchStats, raw };
}
