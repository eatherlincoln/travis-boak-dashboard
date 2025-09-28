import React from "react";
import { useInstagramTopPosts } from "@/hooks";
import fallback from "@/assets/fallback.jpg"; // or use /public path

export default function InstagramTopPosts() {
  const { posts, loading } = useInstagramTopPosts();

  if (loading) return <p>Loading…</p>;

  if (!posts || posts.length === 0) {
    return <p className="text-sm text-neutral-500">No Instagram posts yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {posts.map((p) => {
        const base = p.thumbnail_url || fallback;
        const src =
          p.thumbnail_url && p.updated_at
            ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(
                p.updated_at
              ).getTime()}`
            : base;

        return (
          <a
            key={p.url}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-xl border hover:shadow-sm transition"
          >
            <div className="aspect-square w-full overflow-hidden bg-neutral-100">
              <img
                src={src}
                alt={p.caption || "Instagram post"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-2 text-xs text-neutral-600">
              {p.likes ?? 0} likes • {p.comments ?? 0} comments
            </div>
          </a>
        );
      })}
    </div>
  );
}
