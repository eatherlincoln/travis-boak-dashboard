import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

type Post = {
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  updated_at: string | null;
};

export function useInstagramTopPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("top_posts")
        .select(
          "url, thumbnail_url, caption, likes, comments, shares, updated_at"
        )
        .eq("platform", "instagram")
        .order("rank", { ascending: true });

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setPosts([]);
      } else {
        setPosts(data || []);
        setError(null);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { posts, loading, error };
}
