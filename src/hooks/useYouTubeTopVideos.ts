import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type YouTubeVideo = {
  id: string;
  title: string | null;
  thumbnail_url: string | null;
  url: string | null;
  views: number | null;
  likes: number | null;
  published_at: string | null;
  updated_at: string | null;
};

export function useYouTubeTopVideos(limit = 6) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("youtube_videos")
        .select(
          "id,title,thumbnail_url,url,views,likes,published_at,updated_at"
        )
        .order("views", { ascending: false })
        .limit(limit);

      if (!mounted) return;
      if (error) {
        setError(error.message);
        setVideos([]);
      } else {
        setVideos((data as YouTubeVideo[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [limit]);

  return { videos, loading, error };
}
