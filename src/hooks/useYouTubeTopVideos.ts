import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type YtVideo = {
  platform: "youtube";
  rank: number;
  url: string | null;
  caption: string | null;
  image_url: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  updated_at?: string | null;
};

export function useYouTubeTopVideos() {
  const [videos, setVideos] = useState<YtVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("top_posts")
        .select(
          "platform, rank, url, caption, image_url, views, likes, comments, updated_at"
        )
        .eq("platform", "youtube")
        .order("rank", { ascending: true });

      if (!alive) return;
      if (error) {
        setVideos([]);
      } else {
        const safe = Array.isArray(data) ? data.filter(Boolean) : [];
        setVideos(safe as YtVideo[]);
      }
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { videos, loading };
}
