import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export function useInstagramTopPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("top_posts")
        .select("*")
        .eq("platform", "instagram")
        .order("rank", { ascending: true });

      if (error) {
        console.error("Error fetching IG posts:", error.message);
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
