import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export type IgPost = {
  id?: string;
  title?: string;
  image?: string;
  url?: string | null;
  likesNumber?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  reach?: number;
};

const FALLBACK: IgPost[] = [
  {
    title: "Wave 1",
    image: "/lovable-uploads/18016eb8-2534-4985-b632-e025251442b2.png",
    likesNumber: 3200,
    comments: 95,
    shares: 42,
    saves: 60,
    reach: 18000,
    url: "#",
  },
  {
    title: "Wave 2",
    image: "/lovable-uploads/350aac33-19a1-4c3e-bac9-1e7258ac89b7.png",
    likesNumber: 2900,
    comments: 88,
    shares: 35,
    saves: 50,
    reach: 16000,
    url: "#",
  },
  {
    title: "Wave 3",
    image: "/lovable-uploads/593bbc81-f03e-419e-a492-8024f176fd1a.png",
    likesNumber: 2500,
    comments: 70,
    shares: 28,
    saves: 45,
    reach: 14000,
    url: "#",
  },
];

export function useInstagramPosts(limit = 6) {
  const [posts, setPosts] = useState<IgPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from<IgPost>("instagram_posts")
        .select("*")
        .order("reach", { ascending: false })
        .limit(limit);
      if (!cancelled) {
        if (error || !data?.length) setPosts(FALLBACK);
        else setPosts(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const refetch = async () => {
    const { data, error } = await supabase
      .from<IgPost>("instagram_posts")
      .select("*")
      .order("reach", { ascending: false })
      .limit(limit);
    if (error || !data?.length) setPosts(FALLBACK);
    else setPosts(data);
  };

  return { posts, loading, refetch };
}
