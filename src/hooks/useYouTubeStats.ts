import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type YouTubeStats = {
  channel_id: string | null;
  subscriber_count: number | null;
  view_count: number | null;
  video_count: number | null;
  updated_at: string | null;
};

export function useYouTubeStats() {
  const [stats, setStats] = useState<YouTubeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("youtube_stats")
        .select("channel_id,subscriber_count,view_count,video_count,updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        setError(error.message);
        setStats(null);
      } else {
        setStats((data as YouTubeStats) ?? null);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { stats, loading, error };
}
