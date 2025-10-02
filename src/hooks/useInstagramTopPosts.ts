import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "./useAutoRefresh";

type InstagramPost = {
  rank: number;
  url: string;
  caption?: string;
  image_url?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  updated_at?: string | null;
};

export function useInstagramTopPosts() {
  const { version } = useRefreshSignal(); // re-fetch after admin saves
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("top_posts")
        .select("*")
        .eq("platform", "instagram")
        .order("rank", { ascending: true });

      if (error)
        console.error("Error fetching Instagram posts:", error.message);

      if (active) {
        setPosts((data as InstagramPost[]) || []);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [version]);

  return { posts, loading };
}
