import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type IgPost = {
  platform: "instagram";
  rank: number;
  url: string | null;
  caption: string | null;
  image_url: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  updated_at?: string | null;
};

export function useInstagramTopPosts() {
  const [posts, setPosts] = useState<IgPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("top_posts")
        .select(
          "platform, rank, url, caption, image_url, likes, comments, shares, updated_at"
        )
        .eq("platform", "instagram")
        .order("rank", { ascending: true });

      if (!alive) return;
      if (error) {
        setPosts([]);
      } else {
        const safe = Array.isArray(data) ? data.filter(Boolean) : [];
        setPosts(safe as IgPost[]);
      }
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { posts, loading };
}
