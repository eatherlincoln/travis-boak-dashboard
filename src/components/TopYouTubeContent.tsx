import React from "react";
import { useYouTubeTopVideos } from "@/hooks/useYouTubeTopVideos";

function fmtK(n: number | null | undefined) {
  if (!n || n <= 0) return "0";
  if (n >= 1000000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export default function TopYouTubeContent() {
  const { posts, loading, error } = useYouTubeTopVideos();

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading YouTube content…</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-red-600">Failed to load YouTube: {error}</p>
    );
  }
  if (!posts.length) {
    return (
      <p className="text-sm text-neutral-500">
        No YouTube videos saved yet. Add them in Admin.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {posts.slice(0, 2).map((v, idx) => {
        const base = v.image_url || "/sheldon-profile.png";
        const src =
          v.image_url && v.updated_at
            ? `${base}${base.includes("?") ? "&" : "?"}v=${Date.parse(
                v.updated_at
              )}`
            : base;

        return (
          <a
            key={`${v.rank}-${idx}`}
            href={v.url || "#"}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow transition"
          >
            <div className="aspect-video w-full relative">
              <img
                src={src}
                alt="YouTube video"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 bg-black/60 rounded-full flex items-center justify-center text-white">
                  ▶
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {v.url ? new URL(v.url).searchParams.get("v") : "YouTube Video"}
              </p>
              <div className="mt-1 flex gap-4 text-xs text-neutral-600">
                <span>👁 {fmtK(v.views)} views</span>
                <span>👍 {fmtK(v.likes)} likes</span>
                <span>💬 {fmtK(v.comments)} comments</span>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
