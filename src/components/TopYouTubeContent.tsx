import React from "react";

type Props = {
  hideTitle?: boolean;
  /** Tailwind class to control the card height per row on desktop */
  rowHeightClass?: string; // e.g. "lg:h-[360px]"
};

const videos = [
  {
    id: "INJLrBxBHHc",
    title: "POV Snapper Rocks — First Swell",
    thumb: "https://img.youtube.com/vi/INJLrBxBHHc/mqdefault.jpg",
    views: "116K",
  },
  {
    id: "FRC3mKhAO5U",
    title: "POV Best of Snapper Rocks",
    thumb: "https://img.youtube.com/vi/FRC3mKhAO5U/mqdefault.jpg",
    views: "54K",
  },
];

export default function TopYouTubeContent({
  hideTitle,
  rowHeightClass = "lg:h-[360px]",
}: Props) {
  return (
    <div>
      {!hideTitle && (
        <h4 className="text-base md:text-lg font-semibold mb-3">
          Top Performing YouTube Content
        </h4>
      )}

      <div className="flex flex-col gap-6">
        {videos.map((v) => (
          <div
            key={v.id}
            className={`${rowHeightClass} rounded-xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden flex flex-col`}
          >
            {/* Media fills available height (landscape) */}
            <div className="relative flex-1">
              <img
                src={v.thumb}
                alt={v.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <div className="p-4">
              <div className="font-medium mb-1">{v.title}</div>
              <div className="text-sm text-gray-700">👁️ {v.views} views</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
