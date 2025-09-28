import React from "react";
import { useYouTubeTopVideos } from "@/hooks/useYouTubeTopVideos";
import { Card } from "@/components/ui/card";
import { Youtube, Eye, Heart, MessageCircle } from "lucide-react";

export default function TopYouTubeContent() {
  const { videos } = useYouTubeTopVideos(); // expects id, image_url, title/caption, views, likes, comments, updated_at
  if (!videos?.length) return null;

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md bg-red-100 p-1">
          <Youtube className="h-4 w-4 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold">
          Top Performing YouTube Content
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {videos.map((v) => {
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
              className="overflow-hidden rounded-lg border bg-white shadow-sm"
            >
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={src}
                  alt={v.title || "YouTube video"}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-3">
                {v.title && (
                  <div className="mb-1 line-clamp-2 text-sm font-medium text-neutral-900">
                    {v.title}
                  </div>
                )}

                {/* Icon metrics: views • likes • comments */}
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-neutral-600" />
                    <span>{v.views?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>{v.likes?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span>{v.comments?.toLocaleString() ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
