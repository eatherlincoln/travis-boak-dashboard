import React from "react";
import { useInstagramTopPosts } from "@/hooks/useInstagramTopPosts";

function fmtK(n: number | null | undefined) {
  if (!n || n <= 0) return "0";
  if (n >= 1000000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export default function InstagramTopPosts() {
  const { posts, loading, error } = useInstagramTopPosts();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-56 rounded-xl bg-neutral-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        Failed to load Instagram posts: {error}
      </p>
    );
  }

  if (!posts.length) {
    return (
      <p className="text-sm text-neutral-500">
        No Instagram posts saved yet. Add them in Admin → Instagram.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {posts.slice(0, 4).map((p, idx) => {
        const base = p.image_url || "/sheldon-profile.png";
        const src =
          p.image_url && p.updated_at
            ? `${base}${base.includes("?") ? "&" : "?"}v=${Date.parse(
                p.updated_at
              )}`
            : base;

        return (
          <a
            key={`${p.rank}-${idx}`}
            href={p.url || "#"}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-2xl border border-neutral-200 overflow-hidden bg-white shadow-sm hover:shadow"
          >
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src={src}
                alt="Instagram post"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>

            <div className="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-700 flex items-center gap-3">
              <span>{fmtK(p.likes)} likes</span>
              <span>•</span>
              <span>{fmtK(p.comments)} comments</span>
              <span>•</span>
              <span>{fmtK(p.shares)} shares</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
