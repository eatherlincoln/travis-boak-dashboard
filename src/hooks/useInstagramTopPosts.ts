import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "@/hooks";

type Post = {
  media_id: string;
  media_url: string | null;
  permalink: string | null;
  like_count: number | null;
  comment_count: number | null; // note singular column name
  updated_at: string | null;
};

export function useInstagramTopPosts(limit: number = 6) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { tick } = useRefreshSignal();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("instagram_posts_public")
        .select(
          "media_id, media_url, permalink, like_count, comment_count, updated_at"
        )
        .order("like_count", { ascending: false })
        .limit(limit);

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setPosts([]);
        setLoading(false);
        return;
      }

      setPosts((data as Post[]) ?? []);
      setError(null);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [tick, limit]);

  return { posts, loading, error };
}
