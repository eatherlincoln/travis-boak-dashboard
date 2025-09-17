import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type IGPost = {
  media_id: string;
  caption: string | null;
  permalink: string | null;
  media_url: string | null;
  like_count: number | null;
  comment_count: number | null;
  reach: number | null;
  saves: number | null;
  timestamp: string | null;
  updated_at: string;
};

export function useInstagramTopPosts(limit = 6) {
  const [rows, setRows] = useState<IGPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("instagram_posts_public")
      .select("*")
      .order("like_count", { ascending: false })
      .limit(limit);
    if (error) setErr(error.message);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel("ig_posts_public")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "instagram_posts_public" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [limit]);

  return { rows, loading, err, reload: load };
}
