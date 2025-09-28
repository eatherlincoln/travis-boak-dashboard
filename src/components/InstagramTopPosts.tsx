import React from "react";
import { useInstagramTopPosts } from "@/hooks/useInstagramTopPosts";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export default function InstagramTopPosts() {
  const { posts, loading } = useInstagramTopPosts();

  if (loading) return <p>Loading…</p>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {posts.map((p, i) => {
        const src =
          p.image_url && p.updated_at
            ? `${p.image_url}?v=${new Date(p.updated_at).getTime()}`
            : "/sheldon-profile.png";
        return (
          <div key={i} className="rounded-xl overflow-hidden border shadow-sm">
            <img src={src} alt="" className="w-full h-40 object-cover" />
            <div className="flex justify-around text-xs p-2 text-neutral-600">
              <span className="flex items-center gap-1">
                <Heart size={14} /> {p.likes ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} /> {p.comments ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Share2 size={14} /> {p.shares ?? 0}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
