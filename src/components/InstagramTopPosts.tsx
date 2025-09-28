import React from "react";
import { useInstagramTopPosts } from "@/hooks/useInstagramTopPosts";

function formatNum(n?: number | null) {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

export default function InstagramTopPosts() {
  const { posts, loading, error } = useInstagramTopPosts();

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading…</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-red-600">
        Couldn’t load Instagram posts: {error}
      </p>
    );
  }
  if (!posts.length) {
    return <p className="text-sm text-neutral-500">No Instagram posts yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {posts.slice(0, 4).map((p, idx) => {
        // build thumbnail src with cache-busting if updated_at exists
        const base =
          (p.image_url && p.image_url.trim()) || "/sheldon-profile.png";
        const src =
          p.image_url && p.updated_at
            ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(
                p.updated_at
              ).getTime()}`
            : base;

        return (
          <a
            key={`${p.platform}-${p.rank ?? idx}-${p.url ?? "no-url"}`}
            href={p.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={src}
                alt="Instagram post"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>

            {/* NO caption/title for Instagram — just the metrics row */}
            <div className="px-4 py-3 border-t border-neutral-200 text-sm text-neutral-700">
              <span className="font-medium">{formatNum(p.likes)} likes</span>
              <span className="mx-2">•</span>
              <span>{formatNum(p.comments)} comments</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
