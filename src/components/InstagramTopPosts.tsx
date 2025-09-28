import React from "react";
import { useInstagramTopPosts } from "@/hooks";
import Fallback from "@/assets/fallback.jpg"; // replace with your fallback image path

export default function InstagramTopPosts() {
  const { posts, loading, error } = useInstagramTopPosts();

  if (loading) {
    return (
      <p className="text-sm text-neutral-500">Loading top Instagram posts…</p>
    );
  }
  if (error) {
    return <p className="text-sm text-red-500">Error: {error.message}</p>;
  }
  if (!posts || posts.length === 0) {
    return (
      <p className="text-sm text-neutral-500">No Instagram posts available.</p>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-neutral-800">
        Top Instagram Posts
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {posts.map((p, i) => {
          const base = p.thumbnail_url || Fallback;
          const src =
            p.thumbnail_url && p.updated_at
              ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(
                  p.updated_at
                ).getTime()}`
              : base;

          return (
            <div
              key={i}
              className="group relative rounded-lg overflow-hidden bg-neutral-100"
            >
              <img
                src={src}
                alt={p.caption || "Instagram post"}
                className="w-full h-40 object-cover rounded-lg ring-1 ring-neutral-200/70 group-hover:ring-neutral-300 transition"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                {p.likes ? `${p.likes} likes` : ""}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-neutral-500">
        Last updated{" "}
        {posts[0]?.updated_at
          ? new Date(posts[0].updated_at).toLocaleDateString()
          : "—"}
      </p>
    </div>
  );
}
