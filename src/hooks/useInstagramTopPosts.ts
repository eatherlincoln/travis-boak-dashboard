import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type TopPost = {
  id: string;
  platform: string;
  rank: number;
  url: string | null;
  image_url: string | null;
  caption: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  updated_at: string | null;
};

export function useInstagramTopPosts(limit = 4) {
  const [data, setData] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("top_posts")
        .select(
          "id,platform,rank,url,image_url,caption,likes,comments,shares,updated_at"
        )
        .eq("platform", "instagram")
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
