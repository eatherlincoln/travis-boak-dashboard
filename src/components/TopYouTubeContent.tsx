import React from "react";
import { useYouTubeTopVideos } from "@/hooks/useYouTubeTopVideos";
import { Card } from "@/components/ui/card";

/** Inline SVG icons */
const Icon = {
  youtube: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  ),
  eye: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 5c-5.5 0-10 5-10 7s4.5 7 10 7 10-5 10-7-4.5-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
    </svg>
  ),
  heart: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 21s-6.716-4.248-9.428-7.38C.686 11.358.996 8.5 3.02 6.93 5.044 5.36 7.77 5.9 9.2 7.76c1.43-1.86 4.156-2.4 6.18-.83 2.025 1.57 2.335 4.43.448 6.69C18.716 16.752 12 21 12 21z" />
    </svg>
  ),
  comment: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
    </svg>
  ),
};

export default function TopYouTubeContent() {
  const { videos } = useYouTubeTopVideos();
  if (!videos?.length) return null;

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex rounded-md bg-red-100 p-1">
          <Icon.youtube className="h-4 w-4 text-red-600" />
        </span>
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
              key={`${v.platform}-${v.rank}`}
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
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-1">
                    <Icon.eye className="h-4 w-4 text-neutral-600" />
                    <span>{v.views?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon.heart className="h-4 w-4 text-red-500" />
                    <span>{v.likes?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon.comment className="h-4 w-4 text-blue-500" />
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
