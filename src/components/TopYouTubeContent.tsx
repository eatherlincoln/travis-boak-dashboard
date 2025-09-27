import React from "react";
import { useYouTubeTopVideos } from "../hooks/useYouTubeTopVideos";
import { useYouTubeStats } from "../hooks/useYouTubeStats";

const n = (v?: number | null) =>
  typeof v === "number" ? v.toLocaleString() : "—";

export default function TopYouTubeContent() {
  const { videos, loading: vLoading } = useYouTubeTopVideos();
  const { stats, loading: sLoading } = useYouTubeStats();

  const updatedAt =
    (videos?.[0]?.updated_at as string | undefined) ??
    (stats?.updated_at as string | undefined);

  return (
    <section className="admin-card rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Top YouTube Content</h2>
        {updatedAt && (
          <span className="text-xs text-neutral-500">
            Last updated {new Date(updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((v) => (
            <a
              key={v.id}
              href={v.url}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-xl border hover:shadow-sm transition-shadow"
            >
              <div className="aspect-video w-full overflow-hidden bg-neutral-100">
                <img
                  src={v.thumbnail_url}
                  alt={v.title ?? ""}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <div className="line-clamp-2 text-sm font-medium">
                  {v.title ?? "Untitled video"}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {n(v.views)} views • {n(v.likes)} likes
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border p-4 text-center">
            <div className="text-xl font-semibold">
              {sLoading ? "…" : n(stats?.subscriber_count)}
            </div>
            <div className="text-xs text-neutral-500">Subscribers</div>
          </div>
          <div className="rounded-xl border p-4 text-center">
            <div className="text-xl font-semibold">
              {sLoading ? "…" : n(stats?.view_count)}
            </div>
            <div className="text-xs text-neutral-500">Total Views</div>
          </div>
          <div className="rounded-xl border p-4 text-center">
            <div className="text-xl font-semibold">
              {sLoading ? "…" : n(stats?.video_count)}
            </div>
            <div className="text-xs text-neutral-500">Videos</div>
          </div>
        </div>
      )}
    </section>
  );
}
