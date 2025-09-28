import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";

export type YouTubeVideo = {
  rank: number | null;
  url: string | null;
  image_url: string | null;
  title: string | null;
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
      setError(null);

      // Pull both image_url and thumbnail_url (legacy) so UI always has a picture.
      const { data, error } = await supabase
        .from("top_posts")
        .select(
          "rank,url,image_url,thumbnail_url,caption,views,likes,comments,updated_at"
        )
        .eq("platform", "youtube")
        .order("rank", { ascending: true, nullsFirst: false })
        .order("updated_at", { ascending: false });

      if (!alive) return;

      if (error) {
        setError(error.message);
        setVideos([]);
        setLoading(false);
        return;
      }

      const rows = (data || []).map((r) => ({
        rank: r.rank ?? null,
        url: r.url ?? null,
        image_url: r.image_url || r.thumbnail_url || null, // tolerate legacy
        title: r.caption ?? null,
        views: r.views ?? null,
        likes: r.likes ?? null,
        comments: r.comments ?? null,
        updated_at: r.updated_at ?? null,
      }));

      // Only keep 1–2
      const topTwo = rows
        .filter((r) => r.url) // must have a link
        .sort((a, b) => {
          // rank ASC, then updated_at DESC
          if (a.rank != null && b.rank != null) return a.rank - b.rank;
          if (a.rank != null) return -1;
          if (b.rank != null) return 1;
          return (
            new Date(b.updated_at || 0).getTime() -
            new Date(a.updated_at || 0).getTime()
          );
        })
        .slice(0, 2);

      setVideos(topTwo);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [tick]);

  return { videos, loading, error };
}
