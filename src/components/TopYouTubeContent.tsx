import React from "react";
import { useYouTubeTopVideos } from "@/hooks/useYouTubeTopVideos";
import { Eye, Heart, MessageCircle, Play } from "lucide-react";

/** Try to extract a video id from common YT URL formats */
function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      // https://youtu.be/<id>
      return u.pathname.split("/").filter(Boolean)[0] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      // https://www.youtube.com/watch?v=<id>
      const v = u.searchParams.get("v");
      if (v) return v;
      // https://www.youtube.com/embed/<id>
      const parts = u.pathname.split("/").filter(Boolean);
      const embedIdx = parts.findIndex((p) => p === "embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    }
  } catch {
    /* noop */
  }
  return null;
}

function deriveYouTubeThumb(url: string | null | undefined): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

export default function TopYouTubeContent() {
  const { videos, loading } = useYouTubeTopVideos();
  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;

  return (
    <div className="flex flex-col gap-4 h-full">
      {videos.map((v, i) => {
        const fromDb = v.image_url || v.thumbnail_url || null;
        const fromUrl = deriveYouTubeThumb(v.url);
        const base = fromDb || fromUrl || "/sheldon-profile.png";
        const src =
          base && v.updated_at
            ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(
                v.updated_at
              ).getTime()}`
            : base;

        return (
          <article
            key={i}
            className="rounded-xl overflow-hidden border shadow-sm"
          >
            <div className="relative w-full aspect-[16/9]">
              <img
                src={src}
                alt={v.caption || "YouTube video"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="rounded-full bg-black/50 p-3">
                  <Play size={18} className="text-white" />
                </div>
              </div>
            </div>

            <div className="p-3">
              {v.caption && (
                <h4 className="text-sm font-medium text-neutral-900 line-clamp-2">
                  {v.caption}
                </h4>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-neutral-600">
                <span className="inline-flex items-center gap-1">
                  <Eye size={14} /> {v.views ?? 0}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart size={14} /> {v.likes ?? 0}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle size={14} /> {v.comments ?? 0}
                </span>
              </div>
            </div>
          </article>
        );
      })}
      <div className="flex-1 min-h-[0.5rem]" />
    </div>
  );
}
