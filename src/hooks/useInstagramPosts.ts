import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type IGPost = {
  id: string;
  title: string;
  image: string;
  url?: string;
  likesNumber: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  posted_at?: string;
};

export function useInstagramPosts() {
  const [posts, setPosts] = useState<IGPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "id,title,image,url,likesNumber,comments,shares,saves,reach,posted_at,platform"
        )
        .eq("platform", "instagram")
        .order("reach", { ascending: false })
        .limit(6);
      if (error) throw error;
      setPosts((data ?? []) as IGPost[]);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load posts");
      console.error("useInstagramPosts error:", e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}
