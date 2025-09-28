import React from "react";
import { useYouTubeTopVideos } from "@/hooks/useYouTubeTopVideos";

const fmt = (n?: number | null) => {
  if (!n && n !== 0) return "0";
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
};

export default function TopYouTubeContent() {
  const { data, loading } = useYouTubeTopVideos(2);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-red-500/80" />
        <h3 className="text-sm font-semibold text-neutral-800">
          Top Performing YouTube Content
        </h3>
      </div>

      {loading && <p className="text-sm text-neutral-500">Loading…</p>}

      {!loading && (
        <div className="space-y-5">
          {data.map((v) => {
            const base = v.image_url || "/sheldon-profile.png";
            const src =
              v.image_url && v.updated_at
                ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(
                    v.updated_at
                  ).getTime()}`
                : base;

            return (
              <div key={v.id} className="overflow-hidden rounded-xl border">
                <a
                  href={v.url ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <img
                    src={src}
                    alt={v.caption || "YouTube video"}
                    className="h-56 w-full object-cover"
                  />
                </a>
                <div className="px-4 py-3">
                  {v.caption && (
                    <div className="mb-1 line-clamp-1 text-sm font-medium text-neutral-900">
                      {v.caption}
                    </div>
                  )}
                  <div className="flex gap-3 text-sm text-neutral-700">
                    <span>{fmt(v.views)} views</span>
                    <span>•</span>
                    <span>{fmt(v.likes)} likes</span>
                    <span>•</span>
                    <span>{fmt(v.comments)} comments</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
