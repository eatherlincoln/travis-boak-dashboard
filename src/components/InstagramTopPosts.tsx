import React from "react";
import { useInstagramTopPosts } from "@/hooks";

// helper for formatting numbers
const n = (v?: number | null) =>
  typeof v === "number" ? v.toLocaleString() : "—";

export default function InstagramTopPosts() {
  const { posts, loading } = useInstagramTopPosts();

  if (loading) return <p>Loading…</p>;

  if (!posts || posts.length === 0)
    return <p className="text-sm text-neutral-500">No Instagram posts yet.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {posts.map((p, i) => {
        const base = p.thumbnail_url || "/sheldon-profile.png";
        const src =
          p.thumbnail_url && p.updated_at
            ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(
                p.updated_at
              ).getTime()}`
            : base;

        return (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="group block overflow-hidden rounded-xl border hover:shadow-sm transition-shadow"
          >
            <div className="aspect-square w-full overflow-hidden bg-neutral-100">
              <img
                src={src}
                alt={p.caption || "Instagram post"}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <div className="line-clamp-2 text-sm font-medium">
                {p.caption || "Untitled post"}
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                {n(p.likes)} likes • {n(p.comments)} comments
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
