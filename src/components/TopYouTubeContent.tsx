import React from "react";
import { useYouTubeTopVideos } from "@/hooks/useYouTubeTopVideos";
import { PlayCircle, Eye, Heart, MessageCircle, Youtube } from "lucide-react";

function fmt(n?: number | null) {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function TopYouTubeContent() {
  const { videos, loading, error } = useYouTubeTopVideos();

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Youtube className="h-5 w-5 text-red-500" />
        <h3 className="text-sm font-semibold text-neutral-800">
          Top Performing YouTube Content
        </h3>
      </div>

      {loading && <p className="text-sm text-neutral-500">Loading…</p>}
      {error && (
        <p className="text-sm text-red-600">Couldn’t load videos: {error}</p>
      )}

      {!loading && !error && videos.length === 0 && (
        <p className="text-sm text-neutral-500">No videos yet.</p>
      )}

      <div className="mt-2 space-y-6">
        {videos.map((v) => {
          const base = v.image_url || "/sheldon-profile.png";
          const src =
            v.image_url && v.updated_at
              ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(
                  v.updated_at
                ).getTime()}`
              : base;

          return (
            <a
              key={v.rank}
              href={v.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="block group"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl ring-1 ring-neutral-200">
                <img
                  src={src}
                  alt={v.title || "YouTube video"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 grid place-items-center bg-black/20">
                  <PlayCircle className="h-14 w-14 text-white/95 drop-shadow" />
                </div>
              </div>

              <div className="mt-2">
                <p className="line-clamp-1 text-sm font-medium text-neutral-900">
                  {v.title || "Untitled video"}
                </p>
                <div className="mt-1 flex items-center gap-4 text-[13px] text-neutral-600">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-4 w-4" /> {fmt(v.views)} views
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-4 w-4" /> {fmt(v.likes)} likes
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" /> {fmt(v.comments)}{" "}
                    comments
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
