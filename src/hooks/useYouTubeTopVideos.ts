import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";
import { useRefreshSignal } from "./useAutoRefresh";

type YouTubeVideo = {
  rank: number;
  url: string;
  caption?: string; // title/description field you’re using
  image_url?: string; // uploaded/override thumbnail
  views?: number;
  likes?: number;
  comments?: number;
  updated_at?: string | null;
};

export function useYouTubeTopVideos() {
  const { version } = useRefreshSignal(); // re-fetch after admin saves
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("top_posts")
        .select("*")
        .eq("platform", "youtube")
        .order("rank", { ascending: true });

      if (error) console.error("Error fetching YouTube videos:", error.message);

      if (active) {
        setVideos((data as YouTubeVideo[]) || []);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [version]);

  return { videos, loading };
}
