import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks";

type Totals = {
  instagram_followers: number;
  youtube_subscribers: number;
  tiktok_followers: number;
  updated_at: string | null;
};

export function useFollowerTotals() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { tick } = useRefreshSignal(); // 👈 listen for admin refresh events

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("platform_stats")
        .select("platform,follower_count,updated_at")
        .order("updated_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setTotals(null);
        setLoading(false);
        return;
      }

      const latest: Record<
        string,
        { follower_count: number; updated_at: string | null }
      > = {};

      for (const r of data || []) {
        const key = (r.platform || "").toLowerCase();
        if (!latest[key]) {
          latest[key] = {
            follower_count: r.follower_count ?? 0,
            updated_at: r.updated_at ?? null,
          };
        }
      }

      const updated_at =
        latest.instagram?.updated_at ||
        latest.youtube?.updated_at ||
        latest.tiktok?.updated_at ||
        null;

      setTotals({
        instagram_followers: latest.instagram?.follower_count ?? 0,
        youtube_subscribers: latest.youtube?.follower_count ?? 0,
        tiktok_followers: latest.tiktok?.follower_count ?? 0,
        updated_at,
      });
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [tick]); // 👈 re-run whenever admin saves

  return { totals, loading, error };
}
