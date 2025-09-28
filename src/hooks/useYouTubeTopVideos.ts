import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type YouTubeTop = {
  id: string;
  platform: string;
  rank: number;
  url: string | null;
  image_url: string | null;
  caption: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  updated_at: string | null;
};

export function useYouTubeTopVideos(limit = 2) {
  const [data, setData] = useState<YouTubeTop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("top_posts")
        .select(
          "id,platform,rank,url,image_url,caption,views,likes,comments,updated_at"
        )
        .eq("platform", "youtube")
        .order("rank", { ascending: true })
        .limit(limit);

      if (!mounted) return;
      if (error) {
        setError(error.message);
        setData([]);
      } else {
        setData(data || []);
        setError(null);
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [limit]);

  return { data, loading, error };
}
