import React from "react";
import { useInstagramTopPosts } from "@/hooks/useInstagramTopPosts";

const fmt = (n?: number | null) => {
  if (!n && n !== 0) return "0";
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
};

export default function InstagramTopPosts() {
  const { data, loading } = useInstagramTopPosts(4);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-pink-500/80" />
        <h3 className="text-sm font-semibold text-neutral-800">
          Top Performing Posts
        </h3>
      </div>

      {loading && <p className="text-sm text-neutral-500">Loading…</p>}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.map((v) => {
            const base = v.image_url || "/sheldon-profile.png";
            const src =
              v.image_url && v.updated_at
                ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(
                    v.updated_at
                  ).getTime()}`
                : base;

            return (
              <div
                key={v.id}
                className="overflow-hidden rounded-xl border bg-white"
              >
                <a href={v.url ?? undefined} target="_blank" rel="noreferrer">
                  <img
                    src={src}
                    alt="Post"
                    className="h-56 w-full object-cover"
                  />
                </a>
                <div className="flex items-center justify-between px-4 py-3 text-sm text-neutral-700">
                  <div>{fmt(v.likes)} likes</div>
                  <div>•</div>
                  <div>{fmt(v.comments)} comments</div>
                  <div>•</div>
                  <div>{fmt(v.shares)} shares</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
