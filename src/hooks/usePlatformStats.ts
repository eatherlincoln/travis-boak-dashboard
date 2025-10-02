import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "./useAutoRefresh";

type Platform = "instagram" | "youtube" | "tiktok";
type Stats = {
  platform: Platform;
  followers: number | null;
  monthly_views: number | null;
  engagement: number | null;

  // new
  followers_delta?: number | null;
  views_delta?: number | null;
  engagement_delta?: number | null;
  updated_at?: string | null;
};

export function usePlatformStats() {
  const { version } = useRefreshSignal();
  const [data, setData] = useState<Record<Platform, Stats>>({
    instagram: {
      platform: "instagram",
      followers: null,
      monthly_views: null,
      engagement: null,
    },
    youtube: {
      platform: "youtube",
      followers: null,
      monthly_views: null,
      engagement: null,
    },
    tiktok: {
      platform: "tiktok",
      followers: null,
      monthly_views: null,
      engagement: null,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data: rows } = await supabase
        .from("platform_stats")
        .select(
          "platform, followers, monthly_views, engagement, followers_delta, views_delta, engagement_delta, updated_at"
        )
        .in("platform", ["instagram", "youtube", "tiktok"]);

      if (!alive) return;
      if (rows) {
        const next = { ...data };
        for (const r of rows as any[]) {
          next[r.platform as Platform] = {
            ...r,
          };
        }
        setData(next);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // re-run on refresh tick
  }, [version]);

  return { stats: data, loading };
}
