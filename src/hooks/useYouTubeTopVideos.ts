import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";

export type YouTubeVideo = {
  rank: number;
  url: string | null;
  image_url: string | null; // thumbnail from storage (public URL)
  title: string | null; // optional caption/title
  views: number | null;
  likes: number | null;
  comments: number | null;
  updated_at: string | null;
};

export function useYouTubeTopVideos() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tick } = useRefreshSignal();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("top_posts")
        .select("rank,url,image_url,caption,views,likes,comments,updated_at")
        .eq("platform", "youtube")
        .order("rank", { ascending: true })
        .limit(2);

      if (!alive) return;

      if (error) {
        setError(error.message);
        setVideos([]);
        setLoading(false);
        return;
      }

      setVideos(
        (data || []).map((r) => ({
          rank: r.rank,
          url: r.url ?? null,
          image_url: r.image_url ?? null,
          title: r.caption ?? null,
          views: r.views ?? null,
          likes: r.likes ?? null,
          comments: r.comments ?? null,
          updated_at: r.updated_at ?? null,
        }))
      );
      setError(null);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [tick]);

  return { videos, loading, error };
}
