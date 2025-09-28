import React from "react";
import { useTikTokTopPosts } from "@/hooks/useTikTokTopPosts";

const buildThumb = (url?: string | null, updated?: string | null) => {
  const base = url || "/sheldon-profile.png";
  return updated
    ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(updated).getTime()}`
    : base;
};

export default function TikTokTopPosts() {
  const { posts, loading, error } = useTikTokTopPosts();

  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!posts?.length)
    return <p className="text-sm text-neutral-500">No TikToks yet.</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {posts.map((p, i) => (
        <div
          key={i}
          className="aspect-square overflow-hidden rounded-lg bg-neutral-100"
        >
          <img
            src={buildThumb(p.thumbnail_url, p.updated_at)}
            alt={p.caption || "TikTok post"}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
