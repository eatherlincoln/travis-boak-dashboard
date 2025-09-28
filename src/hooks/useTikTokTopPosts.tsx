import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type TopPost = {
  platform: "tiktok";
  rank: number;
  url: string | null;
  image_url: string | null;
  caption: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
};

export default function useTikTokTopPosts() {
  const [posts, setPosts] = useState<TopPost[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("top_posts")
        .select(
          "platform, rank, url, image_url, caption, likes, comments, shares"
        )
        .eq("platform", "tiktok")
        .order("rank", { ascending: true })
        .limit(4);

      if (!alive) return;

      if (error) {
        setError(error.message);
        setPosts(null);
      } else {
        setError(null);
        setPosts((data || []) as any);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { posts, loading, error };
}
