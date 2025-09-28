import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type IgTopPost = {
  platform: "instagram";
  rank: number;
  url: string | null;
  image_url: string | null;
  caption: string | null; // kept for schema parity, we won't display it
  likes: number | null;
  comments: number | null;
  shares: number | null;
  updated_at: string | null;
};

export function useInstagramTopPosts() {
  const [posts, setPosts] = useState<IgTopPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("top_posts")
        .select(
          "platform,rank,url,image_url,caption,likes,comments,shares,updated_at"
        )
        .eq("platform", "instagram")
        .order("rank", { ascending: true })
        .order("updated_at", { ascending: false })
        .limit(4);

      if (!alive) return;

      if (error) {
        setError(error.message);
        setPosts([]);
      } else {
        // Defensive sanitize: keep only rows that actually have at least a url or image
        const cleaned = (data ?? [])
          .filter((r) => r && (r.image_url || r.url))
          .slice(0, 4) as IgTopPost[];
        setPosts(cleaned);
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { posts, loading, error };
}
