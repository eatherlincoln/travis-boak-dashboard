// src/hooks/useTikTokTopPosts.ts
import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "./useAutoRefresh";

type TikTokPost = {
  rank: number;
  url: string;
  caption?: string;
  image_url?: string;
  likes?: number;
  comments?: number;
  shares?: number;
};

export function useTikTokTopPosts() {
  const { version } = useRefreshSignal(); // ✅ re-fetch when admin saves
  const [posts, setPosts] = useState<TikTokPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("top_posts")
        .select("*")
        .eq("platform", "tiktok")
        .order("rank", { ascending: true });

      if (error) {
        console.error("Error fetching TikTok posts:", error.message);
      }

      if (active) {
        setPosts(data || []);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [version]); // ✅ refresh when tick() is called

  return { posts, loading };
}
