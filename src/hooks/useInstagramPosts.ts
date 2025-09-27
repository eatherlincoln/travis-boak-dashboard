import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type InstagramPost = {
  media_id: string;
  caption: string | null;
  permalink: string | null;
  media_url: string | null;
  like_count: number | null;
  comment_count: number | null;
  reach: number | null;
  saves: number | null;
  timestamp: string | null;
  updated_at: string | null;
};

export function useInstagramPosts(limit = 6) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("instagram_posts_public")
        .select(
          "media_id, caption, permalink, media_url, like_count, comment_count, reach, saves, timestamp, updated_at"
        )
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (!mounted) return;
      if (error) {
        setError(error.message);
        setPosts([]);
      } else {
        setPosts((data || []) as InstagramPost[]);
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [limit]);

  return { posts, loading, error };
}
