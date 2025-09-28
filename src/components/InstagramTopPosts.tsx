import React from "react";
import { useInstagramTopPosts } from "@/hooks/useInstagramTopPosts";
import { Card } from "@/components/ui/card";
import { Instagram, Heart, MessageCircle, Share2 } from "lucide-react";

export default function InstagramTopPosts() {
  const { posts } = useInstagramTopPosts();
  if (!posts?.length) return null;

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md bg-sky-100 p-1">
          <Instagram className="h-4 w-4 text-sky-600" />
        </div>
        <h2 className="text-lg font-semibold">Top Performing Posts</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {posts.map((p) => {
          const base = p.image_url || "/sheldon-profile.png";
          const src =
            p.image_url && p.updated_at
              ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(
                  p.updated_at
                ).getTime()}`
              : base;

          return (
            <div
              key={p.id}
              className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm"
            >
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={src}
                  alt={p.caption || "Instagram post"}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Icon metrics */}
              <div className="flex items-center justify-between p-2 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>{p.likes?.toLocaleString() ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span>{p.comments?.toLocaleString() ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-4 w-4 text-green-600" />
                  <span>{p.shares?.toLocaleString() ?? 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
