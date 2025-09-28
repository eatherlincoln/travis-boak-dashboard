import React from "react";
import { useInstagramTopPosts } from "@/hooks/useInstagramTopPosts";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export default function InstagramTopPosts() {
  const { posts, loading } = useInstagramTopPosts();
  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;

  return (
    <div className="grid grid-cols-2 gap-4 auto-rows-fr h-full">
      {posts.map((p, i) => {
        const src =
          p.image_url && p.updated_at
            ? `${p.image_url}?v=${new Date(p.updated_at).getTime()}`
            : "/sheldon-profile.png";
        return (
          <div
            key={i}
            className="rounded-xl overflow-hidden border shadow-sm flex h-full flex-col min-w-0"
          >
            {/* Square image block */}
            <div className="w-full aspect-square overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>

            {/* Fixed-height metrics row to keep cards equal */}
            <div className="flex justify-around items-center text-xs p-2 text-neutral-600 h-10">
              <span className="flex items-center gap-1 min-w-0">
                <Heart size={14} /> {p.likes ?? 0}
              </span>
              <span className="flex items-center gap-1 min-w-0">
                <MessageCircle size={14} /> {p.comments ?? 0}
              </span>
              <span className="flex items-center gap-1 min-w-0">
                <Share2 size={14} /> {p.shares ?? 0}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
