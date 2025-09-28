import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export type TopPost = {
  platform: "instagram" | "youtube" | "tiktok";
  rank: number;
  url: string | null;
  thumbnail_url: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  updated_at: string | null;
};

type State = {
  posts: TopPost[];
  loading: boolean;
  error: string | null;
};

export default function useInstagramTopPosts() {
  const [state, setState] = useState<State>({
    posts: [],
    loading: true,
    error: null,
  });

  async function load() {
    setState((s) => ({ ...s, loading: true, error: null }));
    const { data, error } = await supabase
      .from("top_posts")
      .select(
        "platform, rank, url, thumbnail_url, likes, comments, shares, updated_at"
      )
      .eq("platform", "instagram")
      .order("rank", { ascending: true })
      .limit(4);

    if (error) {
      setState({ posts: [], loading: false, error: error.message });
      return;
    }
    setState({ posts: (data as TopPost[]) ?? [], loading: false, error: null });
  }

  useEffect(() => {
    load();
    // Optional: live update when top_posts change
    const channel = supabase
      .channel("top_posts_instagram")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "top_posts",
          filter: "platform=eq.instagram",
        },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { ...state, refresh: load };
}
