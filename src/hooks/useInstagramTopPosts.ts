import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "./useAutoRefresh";

export type InstagramPost = {
  rank: number | null;
  url: string | null;
  image_url: string | null;
  caption: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  updated_at: string | null;
};

export function useInstagramTopPosts() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { tick } = useRefreshSignal();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("top_posts")
        .select(
          "rank,url,image_url,thumbnail_url,caption,likes,comments,shares,updated_at"
        )
        .eq("platform", "instagram")
        .order("rank", { ascending: true, nullsFirst: false })
        .order("updated_at", { ascending: false });

      if (!alive) return;

      if (error) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const rows =
        (data || []).map((r) => ({
          rank: r.rank ?? null,
          url: r.url ?? null,
          image_url: r.image_url || r.thumbnail_url || null,
          caption: r.caption ?? null,
          likes: r.likes ?? null,
          comments: r.comments ?? null,
          shares: r.shares ?? null,
          updated_at: r.updated_at ?? null,
        })) ?? [];

      setPosts(rows.slice(0, 4));
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [tick]);

  return { posts, loading };
}
