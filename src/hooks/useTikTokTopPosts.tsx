import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export function useTikTokTopPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("top_posts")
        .select("*")
        .eq("platform", "tiktok")
        .order("rank", { ascending: true });

      if (error) {
        console.error("Error fetching TikTok posts:", error.message);
        return;
      }

      if (mounted) setPosts(data || []);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { posts, loading };
}
