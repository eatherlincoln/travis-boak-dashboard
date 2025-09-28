import React from "react";
import { Eye, Heart, MessageSquare } from "lucide-react";
import { useYouTubeTopVideos } from "@/hooks"; // barrel export
import clsx from "clsx";

export default function TopYouTubeContent() {
  const { videos, loading, error } = useYouTubeTopVideos();

  if (loading) {
    return (
      <div className="text-sm text-neutral-500">
        Loading top YouTube videos…
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-sm text-red-600">
        Couldn’t load YouTube content: {error}
      </div>
    );
  }
  if (!videos || videos.length === 0) {
    return <div className="text-sm text-neutral-500">No videos yet.</div>;
  }

  return (
    <div className="space-y-6">
      {videos.slice(0, 2).map((v, idx) => {
        const base = v.image_url || "/sheldon-profile.png";
        const src =
          v.image_url && v.updated_at
            ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(
                v.updated_at
              ).getTime()}`
            : base;

        return (
          <article
            key={`${v.platform}-${idx}`}
            className={clsx(
              "overflow-hidden rounded-xl ring-1 ring-neutral-200 bg-white"
            )}
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-100">
              <img
                src={src}
                alt={v.caption || "YouTube video"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="p-4">
              <h4 className="line-clamp-1 text-[15px] font-medium text-neutral-900">
                {v.caption || "Untitled video"}
              </h4>

              <div className="mt-2 flex items-center gap-4 text-[13px] text-neutral-600">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatCount(v.views)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {formatCount(v.likes)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {formatCount(v.comments)}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatCount(n?: number | null) {
  if (!n) return 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n;
}
