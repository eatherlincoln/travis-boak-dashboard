import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type IgTopPost = {
  rank: number;
  url: string | null;
  image_url: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  updated_at: string | null;
};

export function useInstagramTopPosts() {
  const [posts, setPosts] = useState<IgTopPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("top_posts")
        .select("rank,url,image_url,likes,comments,shares,updated_at")
        .eq("platform", "instagram");

      if (!alive) return;

      if (error) {
        setError(error.message);
        setPosts([]);
        setLoading(false);
        return;
      }

      // Normalize + sort: rank ASC, then updated_at DESC (nulls last)
      const items = (data || [])
        .filter(Boolean)
        .map((r) => ({
          rank: Number(r.rank),
          url: r.url ?? null,
          image_url: r.image_url ?? null,
          likes: r.likes ?? null,
          comments: r.comments ?? null,
          shares: r.shares ?? null,
          updated_at: r.updated_at ?? null,
        }))
        .sort((a, b) => {
          if (a.rank !== b.rank) return a.rank - b.rank;
          const ta = a.updated_at ? Date.parse(a.updated_at) : -1;
          const tb = b.updated_at ? Date.parse(b.updated_at) : -1;
          return tb - ta; // newer first
        });

      // Keep first by each rank (1..4) so duplicates don’t appear
      const byRank = new Map<number, IgTopPost>();
      for (const row of items) {
        if (!byRank.has(row.rank) && row.rank >= 1 && row.rank <= 4) {
          byRank.set(row.rank, row);
        }
      }

      const ordered: IgTopPost[] = [1, 2, 3, 4]
        .map((r) => byRank.get(r))
        .filter(Boolean) as IgTopPost[];

      setPosts(ordered);

      // derive most recent updated_at across the four
      const mostRecent =
        ordered
          .map((p) => (p.updated_at ? Date.parse(p.updated_at) : -1))
          .filter((n) => n > 0)
          .sort((a, b) => b - a)[0] ?? null;
      setUpdatedAt(mostRecent ? new Date(mostRecent).toISOString() : null);

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { posts, loading, error, updatedAt };
}
