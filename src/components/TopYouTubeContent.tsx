import React from "react";
import { useYouTubeTopVideos } from "@/hooks/useYouTubeTopVideos";
import { Eye, Heart, MessageCircle, Play } from "lucide-react";

export default function TopYouTubeContent() {
  const { videos, loading } = useYouTubeTopVideos();
  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;

  return (
    <div className="flex flex-col gap-4 h-full">
      {videos.map((v, i) => {
        const src =
          v.thumbnail_url && v.updated_at
            ? `${v.thumbnail_url}?v=${new Date(v.updated_at).getTime()}`
            : "/sheldon-profile.png";

        return (
          <article
            key={i}
            className="rounded-xl overflow-hidden border shadow-sm"
          >
            {/* 16:9 media */}
            <div className="relative w-full aspect-[16/9]">
              <img
                src={src}
                alt={v.caption || "YouTube video"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 grid place-items-center">
                <div className="rounded-full bg-black/50 p-3">
                  <Play size={18} className="text-white" />
                </div>
              </div>
            </div>

            {/* caption + metrics */}
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
      {/* Spacer to help equalize minor height differences if needed */}
      <div className="flex-1 min-h-[0.5rem]" />
    </div>
  );
}
