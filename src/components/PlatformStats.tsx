// src/hooks/usePlatformStats.ts
import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

type Platform = "instagram" | "youtube" | "tiktok";

type Row = {
  platform: Platform;
  followers: number | null;
  monthly_views: number | null;
  engagement: number | null;
  updated_at?: string | null;
};

const PLATFORMS: Platform[] = ["instagram", "youtube", "tiktok"];

function empty() {
  return { followers: 0, monthly_views: 0, engagement: 0 };
}

export function usePlatformStats() {
  const [stats, setStats] = useState<Record<Platform, Row>>({
    instagram: { platform: "instagram", ...empty() },
    youtube: { platform: "youtube", ...empty() },
    tiktok: { platform: "tiktok", ...empty() },
  });
  const [deltas, setDeltas] = useState<
    Record<
      Platform,
      {
        followers: number | null;
        monthly_views: number | null;
        engagement: number | null;
      }
    >
  >({
    instagram: { followers: null, monthly_views: null, engagement: null },
    youtube: { followers: null, monthly_views: null, engagement: null },
    tiktok: { followers: null, monthly_views: null, engagement: null },
  });
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      // Latest stats
      const { data, error } = await supabase
        .from("platform_stats")
        .select("platform, followers, monthly_views, engagement, updated_at")
        .in("platform", PLATFORMS);

      if (error) {
        console.error("platform_stats error:", error.message);
        setLoading(false);
        return;
      }

      const next = {
        instagram: { platform: "instagram", ...empty() },
        youtube: { platform: "youtube", ...empty() },
        tiktok: { platform: "tiktok", ...empty() },
      } as Record<Platform, Row>;

      let latestUpdate: string | null = null;

      (data ?? []).forEach((r: any) => {
        const p = r.platform as Platform;
        if (!PLATFORMS.includes(p)) return;
        next[p] = {
          platform: p,
          followers: Number(r.followers ?? 0),
          monthly_views: Number(r.monthly_views ?? 0),
          engagement: Number(r.engagement ?? 0),
          updated_at: r.updated_at ?? null,
        };
        if (r.updated_at && (!latestUpdate || r.updated_at > latestUpdate)) {
          latestUpdate = r.updated_at;
        }
      });

      // Optional: deltas table (if you haven’t built it, these remain null)
      const { data: deltaData } = await supabase
        .from("platform_stats_deltas")
        .select("platform, followers, monthly_views, engagement")
        .in("platform", PLATFORMS);

      const nextDeltas = { ...deltas };
      (deltaData ?? []).forEach((d: any) => {
        const p = d.platform as Platform;
        if (!PLATFORMS.includes(p)) return;
        nextDeltas[p] = {
          followers: typeof d.followers === "number" ? d.followers : null,
          monthly_views:
            typeof d.monthly_views === "number" ? d.monthly_views : null,
          engagement: typeof d.engagement === "number" ? d.engagement : null,
        };
      });

      if (!alive) return;
      setStats(next);
      setDeltas(nextDeltas);
      setUpdatedAt(latestUpdate);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { stats, deltas, updatedAt, loading };
}
